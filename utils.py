import pandas as pd
import numpy as np
import glob as glob
import os
import json
import boto3
import csv
from datetime import datetime
from enum import Enum
import boto3
from botocore.exceptions import ClientError
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from collections import OrderedDict
import re
from functools import partial
from flask import jsonify
from io import StringIO


class RequestStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


def getStatusType(status):
    if status == "pending":
        return RequestStatus.PENDING
    elif status == "completed":
        return RequestStatus.COMPLETED
    elif status == "failed":
        return RequestStatus.FAILED
    return RequestStatus.IN_PROGRESS


working_dir = "/Volumes/faculty".split("/faculty")[0]

app_mode = os.getenv("FLASK_APP_MODE", "user")
BUCKET_NAME = os.getenv("AWS_DATA_BUCKET", None)
PROD_SECRET_KEY = os.getenv("AWS_SECRET_KEY", None)
PROD_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY", None)
SMTP_USERNAME = os.getenv("SMTP_USERNAME", None)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", None)
DATA_REQUEST_ADMINS_BUCKET = os.environ.get("DATA_REQUEST_ADMINS_BUCKET", "npnl-enigma-data-requests")  
DATA_REQUEST_ADMINS_KEY = os.environ.get("DATA_REQUEST_ADMINS_KEY", "data_form_admins.csv")
S3_SECRET_KEY = os.getenv("AWS_SECRET_KEY", None)
S3_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY", None)

col_mapping = {
    "T1": "T1_in_BIDS",
    "T2": "T2_in_BIDS",
    "DWI": "DWI_in_BIDS",
    "FLAIR": "FLAIR_in_BIDS",
    "Native_Lesion": "Raw_Lesion_in_BIDS",
    "MNI_T1": "MNI_T1_in_BIDS",
    "MNI_Lesion_Mask": "MNI_Lesion_mask_in_BIDS",
}


class BooleanData:
    _data = None
    # try:
    #     data = pd.read_csv('static/data/all_data_boolean_subj_with_ses.csv')
    # except:
    #     data = pd.DataFrame([])

    @classmethod
    def _get_data(cls, path):
        if cls._data is None:
            cls._data = pd.read_csv(path + "/anonymized_data/anonymized_data.csv")
        return cls._data

    @classmethod
    def removeNullRows(cls, cols):
        return cls.data.dropna(subset=cols)

    @classmethod
    def getData(cls, staticPath):
        return cls._get_data(staticPath)

    @classmethod
    def applyFiltersAndGetCount(cls, staticPath, required_cols, session="baseline", or_groups=None):
        try:
            data = cls._get_data(staticPath)  # your existing data loader
            if data is None or data.empty:
                return 0

            # Build list of relevant columns (for NA handling)
            all_relevant_cols = required_cols.copy()
            if or_groups:
                for group in or_groups:
                    all_relevant_cols.extend(group)

            data = data.dropna(subset=all_relevant_cols, how="any")

            for col in required_cols:
                if col in data.columns:
                    data = data[data[col] == 1]

            if or_groups:
                for group in or_groups:
                    valid_cols = [c for c in group if c in data.columns]
                    if not valid_cols:
                        continue
                    # Keep rows where at least one metric in the group == 1
                    group_mask = data[valid_cols].any(axis=1)
                    data = data[group_mask]

            if session == "baseline":
                filtered = data[data["SES"] == "ses-1"]
            else:
                '''
                filtered = data[data["SES"].isin(["ses-1", "ses-2"])]
                valid_bids_ids = filtered.groupby("BIDS_ID")["SES"].apply(
                    lambda x: {"ses-1", "ses-2"}.issubset(set(x))
                )
                '''
                filtered = data[data["SES"].astype(str).str.startswith("ses-")]
                valid_bids_ids = (filtered.groupby("BIDS_ID")["SES"].nunique().ge(2))
                filtered = filtered[filtered["BIDS_ID"].isin(valid_bids_ids[valid_bids_ids].index)]

            return filtered

        except Exception as e:
            print("Error filtering rows:", e)
            return pd.DataFrame([])

def get_boolean_data_from_file(staticPath):
    return BooleanData.getData(staticPath).to_json(orient="records")


def get_data(behavior_filters):
    cols_of_interest = set(["BIDS_ID", "SES", "AGE", "SEX"])
    for key in behavior_filters.keys():
        cols_of_interest.add(key)
    cols_of_interest = list(cols_of_interest)
    req_not_null = [key for key, value in behavior_filters.items() if value["required"]]
    files = glob.glob(
        f"{working_dir}/faculty/sliew/enigma/new/BIDS/derivatives/master_db/master_ENIGMA_db_2024_10_11.csv"
    )
    all_df = pd.DataFrame([])
    for file in sorted(files):
        data = pd.read_csv(file, index_col=False)
        cols = [col for col in cols_of_interest if col in data.columns]
        proposal_data = data[cols].copy()
        all_df = pd.concat([all_df, proposal_data])

    all_df.insert(0, "SESSION_ID", "")
    all_df["SESSION_ID"] = all_df["BIDS_ID"] + "_" + all_df["SES"]
    all_df["SITE"] = all_df["BIDS_ID"].apply(get_site)
    all_df = all_df.drop_duplicates(subset=["SESSION_ID"], ignore_index=True)
    all_df = all_df.dropna(subset=req_not_null)
    all_df = all_df.reset_index(drop=True)

    for key, value in behavior_filters.items():
        if value["required"]:
            min_val = None
            max_val = None

            if "value1" in value and value["value1"]:
                min_val = (
                    int(value["value1"])
                    if value["type"] == "int"
                    else float(value["value1"])
                )
            if "value2" in value and value["value2"]:
                max_val = (
                    int(value["value2"])
                    if value["type"] == "int"
                    else float(value["value2"])
                )

            if value["type"] == "string":
                all_df = all_df.loc[all_df[key] == value["value1"]]
            elif value["type"] in ["int", "float"]:
                if min_val is not None and max_val is not None:
                    all_df = all_df.loc[
                        (all_df[key] >= min_val) & (all_df[key] <= max_val)
                    ]
                elif min_val is not None:
                    all_df = all_df.loc[all_df[key] >= min_val]
                elif max_val is not None:
                    all_df = all_df.loc[all_df[key] <= max_val]
            else:
                print(f"Invalid filter type for {key}: {value['type']}")

    return all_df


def filter_imaging_data(imaging_filters, all_df):
    if not len(all_df):
        return all_df
    for i, row in all_df.iterrows():
        if (
            pd.isnull(row["BIDS_ID"])
            or pd.isna(row["BIDS_ID"])
            or pd.isnull(row["SES"])
        ):
            continue
        sub = row["BIDS_ID"]
        ses = row["SES"]
        site = sub[4:8].upper()
        path = f"{working_dir}/faculty/sliew/enigma/new/BIDS/{site}/{sub}/{ses}/"
        lesion_path = f"{working_dir}/faculty/sliew/enigma/new/BIDS/derivatives/lesion_raw/{site}/{sub}/{ses}/anat/"
        lesion_preproc = f"{working_dir}/faculty/sliew/enigma/new/BIDS/derivatives/lesion_preproc/{site}/{sub}/{ses}/anat/"

        T1 = path + "/anat/" + sub + "_" + ses + "_T1w.nii.gz"
        T2 = path + "/anat/" + sub + "_" + ses + "_T2w.nii.gz"
        DWI = path + "/dwi/" + sub + "_" + ses + "_dwi.nii.gz"
        FLAIR = path + "/anat/" + sub + "_" + ses + "_FLAIR.nii.gz"
        lesion = lesion_path + "*T1lesion_mask.nii.gz"
        MNI_T1 = lesion_preproc + "*T1FinalResampledNorm.nii.gz"
        MNI_mask = lesion_preproc + "*T1lesion_mask.nii.gz"
        if "T1" in imaging_filters:
            T1_files = glob.glob(T1)
            T1_exists = T1_files[0] if T1_files else 0
            all_df.at[i, "T1_in_BIDS"] = T1_exists
        if "T2" in imaging_filters:
            T2_files = glob.glob(T2)
            T2_exists = T2_files[0] if T2_files else 0
            all_df.at[i, "T2_in_BIDS"] = T2_exists
        if "DWI" in imaging_filters:
            DWI_files = glob.glob(DWI)
            DWI_exists = DWI_files[0] if DWI_files else 0
            all_df.at[i, "DWI_in_BIDS"] = DWI_exists
        if "FLAIR" in imaging_filters:
            FLAIR_files = glob.glob(FLAIR)
            FLAIR_exists = FLAIR_files[0] if FLAIR_files else 0
            all_df.at[i, "FLAIR_in_BIDS"] = FLAIR_exists
        if "Raw_Lesion" in imaging_filters:
            lesion_files = glob.glob(lesion)
            lesion_exists = lesion_files[0] if lesion_files else 0
            all_df.at[i, "Lesion_Raw"] = lesion_exists
        if "MNI_T1" in imaging_filters:
            MNI_T1_files = glob.glob(MNI_T1)
            MNI_T1_exists = MNI_T1_files[0] if MNI_T1_files else 0
            all_df.at[i, "MNI_T1_in_BIDS"] = MNI_T1_exists
        if "MNI_Lesion_mask" in imaging_filters:
            MNI_mask_files = glob.glob(MNI_mask)
            MNI_mask_exists = MNI_mask_files[0] if MNI_mask_files else 0
            all_df.at[i, "MNI_mask_in_BIDS"] = MNI_mask_exists

    for key, value in imaging_filters.items():
        if value["required"]:
            all_df = all_df.loc[all_df[col_mapping[key]] != 0]
    return all_df


def get_site(val):
    if pd.isnull(val):
        return val
    return val[4:8].upper()

'''
def get_precomputed_data(timepoint, behavioralFilters, imagingFilters):
    project_root = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(project_root, "static/anonymized_data/anonymized_data.csv")
    all_df = pd.read_csv(
        data_path
    )
    required_behavioral_metrics = [
        key for key, value in behavioralFilters.items() if value["required"]
    ]
    behavioral_metrics = ["BIDS_ID", "SES", "AGE", "SEX", "SITE"] + list(
        col_mapping.values()
    )
    for key in behavioralFilters.keys():
        if key not in behavioral_metrics:
            behavioral_metrics.append(key)
    all_df = all_df[behavioral_metrics]
    all_df = all_df.dropna(subset=required_behavioral_metrics)

    for key, value in behavioralFilters.items():
        if value["required"]:
            min_val = None
            max_val = None

            if (
                "value1" in value
                and value["value1"]
                and value["type"] in ["int", "float"]
            ):
                min_val = (
                    int(value["value1"])
                    if value["type"] == "int"
                    else float(value["value1"])
                )
            if (
                "value2" in value
                and value["value2"]
                and value["type"] in ["int", "float"]
            ):
                max_val = (
                    int(value["value2"])
                    if value["type"] == "int"
                    else float(value["value2"])
                )

            if value["type"] == "string":
                if value["value1"]:
                    all_df = all_df.loc[all_df[key] == value["value1"]]
                else:
                    all_df = all_df.dropna(subset=key)
            elif value["type"] in ["int", "float"]:
                if min_val is not None and max_val is not None:
                    all_df = all_df.loc[
                        (all_df[key] >= min_val) & (all_df[key] <= max_val)
                    ]
                elif min_val is not None:
                    all_df = all_df.loc[all_df[key] >= min_val]
                elif max_val is not None:
                    all_df = all_df.loc[all_df[key] <= max_val]
            else:
                print(f"Invalid filter type for {key}: {value['type']}")

    imaging_cols_to_drop = [
        col for key, col in col_mapping.items() if key not in imagingFilters
    ]
    all_df = all_df.drop(columns=imaging_cols_to_drop)
    for key, value in imagingFilters.items():
        all_df[col_mapping[key]] = all_df[col_mapping[key]].replace(
            ["0", "0.0"], np.nan
        )
        if value["required"]:
            all_df = all_df.loc[all_df[col_mapping[key]].notna()]

    if timepoint == "baseline":
        all_df = all_df[all_df["SES"] == "ses-1"]
    else:
        filtered_df = all_df[all_df["SES"].isin(["ses-1", "ses-2"])]
        valid_bids_ids = filtered_df.groupby("BIDS_ID")["SES"].apply(
            lambda x: set(["ses-1", "ses-2"]).issubset(set(x))
        )
        all_df = filtered_df[
            filtered_df["BIDS_ID"].isin(valid_bids_ids[valid_bids_ids].index)
        ]
    return all_df
'''

'''
def fetch_data(request, download=False):
    timepoint = request["timepoint"] if "timepoint" in request else "multi"
    imaging_lst = request["imaging"]
    behavior_lst = request["behavior"]
    try:
        # result = get_data(behavior_lst)
        # result = filter_imaging_data(imaging_lst, result)
        result = get_precomputed_data(timepoint, behavior_lst, imaging_lst)
        result.reset_index(inplace=True)
        if "index" in result.columns:
            result.drop(columns="index", inplace=True)
        if len(result) > 0:
            if download:
                return {"success": True, "data": result.to_csv(index=False)}
            return {"success": True, "data": result.to_json(orient="records")}
        else:
            return {"success": True}
    except Exception as e:
        print("An error occurred: ", str(e))
        return {"success": False}
'''

def fetch_bool_data():
    with open(os.path.join(os.getcwd(), "boolean_data.json"), "r") as f:
        boolean_data = json.load(f)
        return {"success": True, "data": boolean_data}

'''
def get_filtered_rows_count(staticPath, filters):
    timepoint = filters["timepoint"] if "timepoint" in filters else "baseline"
    all_filters = filters["behavioral"] + [
        col_mapping[col] for col in filters["imaging"]
    ]
    count = BooleanData.applyFiltersAndGetCount(staticPath, all_filters, timepoint)
    return {"success": True, "count": count}
'''

def get_filtered_rows_count(staticPath, filters):
    """
    Calculate row count after applying AND filters for required metrics
    and OR logic within each OR group.
    """
    try:
        timepoint = filters.get("timepoint", "baseline")
        required_metrics = filters.get("required_metrics", [])
        or_groups = filters.get("or_groups", [])

        count = BooleanData.applyFiltersAndGetCount(
            staticPath,
            required_metrics,
            session=timepoint,
            or_groups=or_groups
        )
        if count.empty:
            return {"success": True, "count": 0, "total_sites": 0, "sessions_per_site": {}}
        total_count = len(count)
        total_sites = count['SITE'].nunique() if 'SITE' in count.columns else 0
        # Sessions per site
        sessions_per_site = {}
        if 'SITE' in count.columns:
            sessions_per_site = count.groupby('SITE').size().to_dict()
            # Sort by site name
            sessions_per_site = dict(sorted(sessions_per_site.items()))
        return {"success": True, "count": total_count, "total_sites": total_sites, "sessions_per_site": sessions_per_site}
        
    except Exception as e:
        print("Error in get_filtered_rows_count:", e)
        return {"success": False, "message": str(e)}
'''
def send_email(recipient):
    smtp_server = "email-smtp.us-east-1.amazonaws.com"
    port = 587  # TLS Port
    sender = "npnlusc@gmail.com"
    subject = "Hello from Amazon SES"
    body = "Hello, this is a test email sent from Amazon SES"
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    try:
        # Create server object with SSL option
        server = smtplib.SMTP(smtp_server, port, timeout=10)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(sender, recipient, text)
        server.quit()
        print("Email sent successfully!")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
'''
def send_email(recipient, subject=None, body=None):
    smtp_server = "email-smtp.us-east-1.amazonaws.com"
    port = 587
    sender = "npnlusc@gmail.com"

    subject = subject or "NPNL Data Request Notification"
    body = body or "A new data request has been submitted."

    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(smtp_server, port, timeout=10)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(sender, recipient, msg.as_string())
        server.quit()
        return True
    except Exception:
        return False

def upload_file_to_s3(file_name, content, object_name=None):
    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    # Upload the file
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=PROD_ACCESS_KEY,
        aws_secret_access_key=PROD_SECRET_KEY,
        region_name="us-east-1",
    )

    try:
        response2 = s3_client.put_object(
            Bucket=BUCKET_NAME, Key="data-requests/" + object_name, Body=content
        )
        return True, "Success"
    except Exception as e:
        print(e)
        return False, str(e)


def add_data_request(data):
    try:
        requestor = data["requestor"]["name"]
        currentTime = datetime.now().strftime("%Y%m%d%H%M%S")
        fileName = f"{requestor}_{currentTime}.json"

        dataRequest = {
            "requestor": data["requestor"],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "request": data,
            "status": "pending",
        }

        json_string = json.dumps(dataRequest).encode("utf-8")

        success, message = upload_file_to_s3(fileName, json_string)
        return {"success": success, "message": message, "filename": fileName}
    except Exception as e:
        print(e)
        return {"success": False, "message": str(e.args[0])}


def get_requests():
    PREFIX_DIR = "data-requests/"
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=PROD_ACCESS_KEY,
        aws_secret_access_key=PROD_SECRET_KEY,
        region_name="us-east-1",
    )
    response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=PREFIX_DIR)
    files = [
        file["Key"]
        for file in response.get("Contents", [])
        if file["Key"].endswith(".json")
    ]
    file_data = []
    for file_key in files:
        file_content = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_key)
        file_name = file_key.split(PREFIX_DIR)[1]
        file_text = file_content["Body"].read().decode("utf-8")
        file_json = json.loads(file_text)

        file_data.append(
            {
                "file_name": file_name,
                "time": file_json["timestamp"],
                "name": file_json["requestor"]["name"],
                "email": file_json["requestor"]["email"],
                "data": file_json["request"],
                "status": (
                    file_json["status"] if "status" in file_json else "pending"
                ).capitalize(),
            }
        )
    return file_data


def get_request_data_from_storage(filename):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=PROD_ACCESS_KEY,
        aws_secret_access_key=PROD_SECRET_KEY,
        region_name="us-east-1",
    )
    response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix="data-requests/")
    file_key = f"data-requests/{filename}"
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_key)
    file_content = response["Body"].read().decode("utf-8")
    file_content = json.loads(file_content)
    data = {
        "file_name": filename,
        "time": file_content["timestamp"],
        "name": file_content["requestor"]["name"],
        "email": file_content["requestor"]["email"],
        "data": file_content["request"],
        "status": (
            file_content["status"] if "status" in file_content else "pending"
        ).capitalize(),
    }
    # data = json.loads(file_content)
    return data


def get_imaging_data_summary(result, imagingFilters):
    if imagingFilters and len(result) > 0:
        imagingCols = ["SITE"] + [col_mapping[col] for col in imagingFilters.keys()]
        imagingDf = result[imagingCols]
        imagingDf.columns = [col.replace("_in_BIDS", "") for col in imagingDf.columns]
        aggregateDict = {}
        for col in imagingDf.columns:
            aggregateDict[col] = "count"
        imagingDataBySite = imagingDf.groupby("SITE").agg(aggregateDict)
        imagingDataBySite.loc["Total"] = imagingDataBySite.sum(numeric_only=True)
        imagingDataBySite = imagingDataBySite.drop(columns=["SITE"])
        imagingDataBySite = imagingDataBySite.reset_index()
        return imagingDataBySite
    return pd.DataFrame({})


def get_records_by_site(result):
    if len(result) > 0:
        imaging_cols = [col for col in result.columns if col in col_mapping.values()]
        behavioral_df = result.drop(columns=imaging_cols)
        count_by_site = behavioral_df.groupby("SITE").size()
        count_by_site = count_by_site.reset_index()
        count_by_site = count_by_site.reindex(columns=["SITE", 0])
        count_by_site = count_by_site.rename(columns={0: "Count"})
        return count_by_site
    return pd.DataFrame({})


def get_behavioral_data_summary(result):
    if len(result) > 0:
        imaging_cols = [col for col in result.columns if col in col_mapping.values()]
        behavioral_df = result.drop(columns=imaging_cols)
        cols_count_by_site = behavioral_df.count()
        cols_count_by_site = cols_count_by_site.reset_index()
        cols_count_by_site = cols_count_by_site.sort_values(
            by=cols_count_by_site.columns[0]
        )
        cols_count_by_site = cols_count_by_site.reindex(columns=["index", 0])
        cols_count_by_site = cols_count_by_site.rename(
            columns={0: "Count", "index": "Attribute"}
        )
        return cols_count_by_site
    return pd.DataFrame({})


def validate_data(df):
    # Replace NaNs with None (which converts to null in JSON)
    df = df.where(pd.notnull(df), None)
    return (
        df.astype(str).replace("nan", "").replace("None", "").to_dict(orient="records")
    )
'''
def get_summarized_data(request):
    timepoint = request["timepoint"] if "timepoint" in request else "multi"
    imaging_lst = request["imaging"]
    behavior_lst = request["behavior"]
    try:
        # result = get_data(behavior_lst)
        # result = filter_imaging_data(imaging_lst, result)
        result = get_precomputed_data(timepoint, behavior_lst, imaging_lst)
        imagingDataBySite = get_imaging_data_summary(result, imaging_lst)
        columnsSummary = get_behavioral_data_summary(result)
        recordsBySite = get_records_by_site(result)
        result.reset_index(inplace=True)
        if "index" in result.columns:
            result.drop(columns="index", inplace=True)
        response = {}
        response["data"] = validate_data(result)
        response["imagingDataBySite"] = validate_data(imagingDataBySite)
        response["columnsSummary"] = validate_data(columnsSummary)
        response["recordsBySite"] = validate_data(recordsBySite)
        return response
    except Exception as e:
        print("An error occurred: ", str(e))
'''

def get_unique_sites(data):
    data = data.dropna()
    site_set = set()
    for site in data:
        site_set.update(site.split(";"))
    return list(site_set)


def get_authors_list():
    try:
        data = pd.read_csv(
            f"{working_dir}/faculty/sliew/enigma/new/AuthorsList/ENIGMA_Members_List_Full_List.csv",
            index_col=None,
        )
        data.reset_index(inplace=True)
        names = data[["index", "First Name", "Last Name"]]
        names.dropna(subset=["First Name", "Last Name"], inplace=True)
        print(names.iloc[25:30])
        # names.drop_duplicates(subset=['First Name', 'Last Name'], inplace=True)
        sites = get_unique_sites(data["BIDS Site"])
        sites_df = pd.DataFrame(sites, columns=["BIDS Site"])
        sites_df.sort_values(by="BIDS Site", inplace=True)
        data = {
            "dataByAuthor": validate_data(names),
            "dataBySite": validate_data(sites_df),
        }
        return {"success": True, "data": json.dumps(data)}
    except Exception as e:
        print(e)
        return {"success": False, "data": ""}


def get_all_authors_data():
    data = pd.read_csv(
        f"{working_dir}/faculty/sliew/enigma/new/AuthorsList/ENIGMA_Members_List_Full_List.csv",
        index_col=None,
    )
    data.reset_index(inplace=True)
    data = data[
        [
            "index",
            "First Name",
            "Last Name",
            "MI",
            "BIDS Site",
            "Department/Divison",
            "University/Institute",
            "City",
            "State/Province",
            "Country",
        ]
    ]
    data.dropna(subset=["First Name", "Last Name"], inplace=True)
    return data


def get_authors_by_site(sites):
    data = get_all_authors_data()
    data = data.dropna(subset=["BIDS Site"])
    mask = data["BIDS Site"].apply(
        lambda x: any(site.strip() in sites for site in x.split(";"))
    )
    filtered_data = data[mask]
    print(filtered_data)
    return filtered_data


def filterByIndex(data, indices):
    mask = data["index"].isin(indices)
    return data[mask]


def get_authors_by_index(indices):
    data = get_all_authors_data()
    return filterByIndex(data, indices)


def format_middle_initial(row):
    middle_initial = str(row["MI"]).strip()
    if pd.notna(row["MI"]):
        if middle_initial[-1] == ".":
            return middle_initial
        else:
            return middle_initial + "."
    else:
        return np.nan


def format_initials(row):
    first_initial = row["First Name"][0]
    last_initial = row["Last Name"][0]
    middle_initial = row["middle_initial"]
    if pd.notna(middle_initial):
        return f"{first_initial}.{str(middle_initial)}{last_initial}."
    else:
        return f"{first_initial}.{last_initial}."


def replace_common_words(department):
    if pd.isna(department):
        return department
    common_words = {
        "&": "and",
        "Dept": "Department",
        "Dept.": "Department",
        "dept": "Department",
        "dept.": "Department",
    }
    for key in common_words.keys():
        department = department.replace(key, common_words[key])
    return department


def format_affiliation(department, city, state, country, zipcode=""):
    # formatted_zip = str(zipcode).split('.')[0].strip()
    output = []
    if pd.notna(department):
        output.append(str(department).strip())
    if pd.notna(city):
        output.append(str(city).strip())
    if pd.notna(state):
        output.append(str(state).strip())
    if pd.notna(country):
        output.append(str(country).strip())
    return ", ".join(output)


def get_formatted_authors_response(request_data):
    if request_data["groupBy"] == "bySite":
        authors_df = get_authors_by_site(set(request_data["sites"]))
    else:
        authors_df = get_authors_by_index(
            list(
                set(
                    request_data["authors"]
                    + (
                        request_data["firstAuthors"]
                        if request_data["firstAuthors"]
                        else []
                    )
                    + (
                        request_data["lastAuthors"]
                        if request_data["lastAuthors"]
                        else []
                    )
                )
            )
        )

    FIRST_AUTHORS = (
        request_data["firstAuthors"]
        if request_data["firstAuthors"] and request_data["groupBy"] == "byAuthor"
        else []
    )
    LAST_AUTHORS = (
        request_data["lastAuthors"]
        if request_data["lastAuthors"] and request_data["groupBy"] == "byAuthor"
        else []
    )
    authors_df_first = filterByIndex(authors_df, FIRST_AUTHORS)
    authors_df_last = filterByIndex(authors_df, LAST_AUTHORS)
    mask = ~authors_df["index"].isin(FIRST_AUTHORS)
    authors_df = authors_df[mask]
    mask = ~authors_df["index"].isin(LAST_AUTHORS)
    authors_df = authors_df[mask]
    # authors_df.drop(FIRST_AUTHORS, inplace=True)
    # authors_df.drop(LAST_AUTHORS, inplace=True)
    authors_df.sort_values("Last Name", inplace=True)
    df_authors = pd.concat([authors_df_first, authors_df, authors_df_last])
    order = FIRST_AUTHORS + list(authors_df["index"]) + LAST_AUTHORS
    df_authors.set_index("index", inplace=True)
    df_authors = df_authors.loc[order]
    df_authors["middle_initial"] = df_authors.apply(
        lambda row: format_middle_initial(row), axis=1
    )
    df_authors["initials"] = df_authors.apply(lambda row: format_initials(row), axis=1)
    print("Department/Divison" in df_authors.columns)

    def getDepartment(row):
        if not pd.isna(row["Department/Divison"]) and not pd.isna(
            row["University/Institute"]
        ):
            return (
                str(row["Department/Divison"]) + ", " + str(row["University/Institute"])
            )
        elif not pd.isna(row["University/Institute"]):
            return str(row["University/Institute"])
        elif not pd.isna(row["Department/Divison"]):
            return str(row["Department/Divison"])
        return np.nan

    df_authors["department"] = df_authors.apply(lambda row: getDepartment(row), axis=1)
    df_authors["department"] = df_authors.apply(
        lambda row: replace_common_words(row["department"]), axis=1
    )

    Affiliations_lst = set()
    Affiliations_dict = {}
    aff_index = 1
    df_authors["affiliation1"] = np.nan
    for index, row in df_authors.iterrows():
        reformatted_affiliation = format_affiliation(
            row["department"], row["City"], row["State/Province"], row["Country"]
        )
        if reformatted_affiliation and reformatted_affiliation not in Affiliations_lst:
            Affiliations_lst.add(reformatted_affiliation)
            df_authors.at[index, "affiliation1"] = reformatted_affiliation
            row["affiliation1"] = reformatted_affiliation
            if reformatted_affiliation:
                Affiliations_dict[reformatted_affiliation] = aff_index
                aff_index = aff_index + 1
        elif reformatted_affiliation:
            df_authors.at[index, "affiliation1"] = reformatted_affiliation
            row["affiliation1"] = reformatted_affiliation

    df_authors["indexed_affiliation"] = np.nan
    superscript_mapping = str.maketrans("0123456789,", "⁰¹²³⁴⁵⁶⁷⁸⁹𝄒")
    for index, row in df_authors.iterrows():
        indexed_affiliation = ""
        if pd.notnull(row["affiliation1"]):
            indexed_affiliation = indexed_affiliation + str(
                Affiliations_dict[row["affiliation1"]]
            ).translate(superscript_mapping)
        if indexed_affiliation:
            df_authors.at[index, "indexed_affiliation"] = indexed_affiliation

    def format_1(initials, affiliation):
        return "{}{}".format(initials, affiliation)

    def format_2(first_name, last_name, affiliation):
        return "{} {}{}".format(first_name, last_name, affiliation)

    def format_3(first_name_initial, middle_initial, last_name, affiliation):
        if pd.notna(middle_initial):
            return "{}.{}{}{}".format(
                first_name_initial, middle_initial, last_name, affiliation
            )
        else:
            return "{}.{}{}".format(first_name_initial, last_name, affiliation)

    print(df_authors)
    if request_data["nameFormatOption"] == 1:
        df_authors["formatted_names"] = df_authors.apply(
            lambda row: format_1(row["initials"], row["indexed_affiliation"]), axis=1
        )
        out = ", ".join(df_authors["formatted_names"])
    if request_data["nameFormatOption"] == 2:
        df_authors["formatted_names"] = df_authors.apply(
            lambda row: format_2(
                row["First Name"], row["Last Name"], row["indexed_affiliation"]
            ),
            axis=1,
        )
        out = ", ".join(df_authors["formatted_names"])
    if request_data["nameFormatOption"] == 3:
        df_authors["formatted_names"] = df_authors.apply(
            lambda row: format_3(
                row["First Name"][0],
                row["middle_initial"],
                row["Last Name"],
                row["indexed_affiliation"],
            ),
            axis=1,
        )
        out = ", ".join(df_authors["formatted_names"])

    # print(df_authors['index'])
    response = ""
    response += "Authors\n"
    response += "{}\n".format(out)
    response += "\nAuthor affiliations\n"
    for key in Affiliations_dict.keys():
        response += "{} {}\n".format(Affiliations_dict[key], key)

    return response


def get_latest_qc_dir(root_directory):
    # Get all folders in the test directory
    folders = [
        f
        for f in os.listdir(root_directory)
        if os.path.isdir(os.path.join(root_directory, f))
    ]

    # Filter folders with date format yyyy_mm_dd
    date_folders = []
    print(os.listdir(root_directory))
    for folder in folders:
        try:
            # Check if the folder name can be parsed as a date
            folder_date = datetime.strptime(folder, "%Y_%m_%d")
            date_folders.append((folder_date, folder))
        except ValueError:
            continue
    print(date_folders)
    # Get the latest folder by date
    if date_folders:
        latest_folder = max(date_folders)[1]  # Get the folder name with the latest date
        print(f"Latest folder: {latest_folder}")
    else:
        print("No valid date folders found.")
        return

    # Path to the log file
    log_file_path = os.path.join(root_directory, latest_folder)

    return log_file_path


# Function to read individual CSV files and aggregate them
def aggregate_csv_files_from_log(bids_id=None, ses_id=None):
    # root_directory = f'{working_dir}/faculty/sliew/enigma/new/GBH/BIDS/derivatives/behavior/qc'
    root_directory = f"/Users/laharireddy/NPNL/PDF_examples"
    data_directory = get_latest_qc_dir(root_directory)

    if data_directory is None:
        print("No data Directory found")
        return None  # Exit if no valid directory is found

    latest_log_path = os.path.join(data_directory, "log_all_behavior.csv")

    # Read the log file into a DataFrame
    files_df = pd.read_csv(latest_log_path)

    max_timestamp_df = files_df.loc[
        files_df.groupby(["BIDS_ID", "SES"])["Timestamp"].idxmax()
    ]

    # Reset the index for better readability
    max_timestamp_df.reset_index(drop=True, inplace=True)

    if bids_id and ses_id:
        max_timestamp_df = max_timestamp_df[
            (max_timestamp_df["BIDS_ID"] == bids_id)
            & (max_timestamp_df["SES"] == ses_id)
        ]

    # Initialize an empty DataFrame to store the aggregated data
    data_df = pd.DataFrame()

    # For each row in files_df, read the corresponding CSV and append to data_df
    for index, row in max_timestamp_df.iterrows():
        file_name = row["File_Name"]  # Get the File_Name from the current row
        file_path = os.path.join(
            data_directory, file_name
        )  # Construct full path to the CSV file

        # Check if the file exists before reading
        if os.path.exists(file_path):
            temp_df = pd.read_csv(file_path)  # Read the individual CSV file
            data_df = pd.concat(
                [data_df, temp_df], ignore_index=True
            )  # Append to data_df
        else:
            print(f"File {file_name} not found in {data_directory}.")

    return data_df


def get_subject_pdf_data(bids_id, ses_id):
    filtered_df = aggregate_csv_files_from_log(bids_id, ses_id)
    return filtered_df


def validate_row_with_validator(row, validator):
    """
    Validates a row based on the provided validator DataFrame.
    Returns a dictionary of errors if any, otherwise an empty dictionary.
    """
    errors = {}
    for _, v_row in validator.iterrows():
        column = v_row["metric_name"]
        var_type = v_row["variable_type"]
        meas_type = v_row["measurement_type"]
        min_value = v_row["min_value"]
        max_value = v_row["max_value"]
        levels = v_row["levels"]

        if column not in row.index:
            continue

        value = row[column]

        if pd.isnull(value):
            continue

        # Handle levels for categorical variables
        if not pd.isnull(levels):
            dict_vals = [pair.split("=") for pair in levels.split(";")]
            if var_type == "int":
                levels = {int(k): v for k, v in dict_vals}
            else:
                levels = {k: v for k, v in dict_vals}

        try:
            # Type conversion
            if var_type == "string":
                value = str(value)
            elif var_type == "int":
                value = int(float(value))
            else:
                continue  # Skip unknown variable types
        except Exception as e:
            errors[column] = f"Error processing value: {e}"
            continue

        # Measurement checks
        if meas_type in ["discrete", "continuous"]:
            if (min_value is not None and value < min_value) or (
                max_value is not None and value > max_value
            ):
                errors[column] = f"{value}: out of range ({min_value}-{max_value})"
        elif meas_type in ["nominal", "ordinal"]:
            if value not in levels.keys():
                errors[column] = f"{value}: not in levels {list(levels.keys())}"

    return errors


def check_hemisphere_consistency(row):
    """
    Checks consistency between hemispheres and returns errors if any.
    """
    errors = {}
    lesion_hemisphere = row["STROKE_HEMISPHERE"]
    if isinstance(lesion_hemisphere, pd.Series):
        lesion_hemisphere = lesion_hemisphere.iloc[0]

    paresis = row["PARETIC"]
    if isinstance(paresis, pd.Series):
        paresis = paresis.iloc[0]

    if pd.isnull(lesion_hemisphere):
        errors["STROKE_HEMISPHERE"] = "Missing critical information"
        return errors

    if pd.isnull(paresis):
        errors["PARETIC"] = "Missing critical information"
        return errors

    side_map = {1: "_L", 2: "_R", 3: "_Bilateral"}
    side = None
    other_side = None

    if (lesion_hemisphere == 1) and (paresis == 2):
        side = "_R"
        other_side = "_L"
    elif (lesion_hemisphere == 2) and (paresis == 1):
        side = "_L"
        other_side = "_R"
    elif lesion_hemisphere == 3:
        errors["STROKE_HEMISPHERE"] = (
            f"{lesion_hemisphere}: bilateral stroke marked; check directionality "
            f"(validation is using paretic side info)"
        )
        side = "_L" if paresis == 1 else "_R"
        other_side = "_R" if paresis == 1 else "_L"
    elif lesion_hemisphere == paresis:
        errors["PARETIC"] = (
            f"{paresis}: paretic side and stroke hemisphere are same; confirm which is correct "
            f"(validation is using paretic side info)"
        )
        side = "_L" if paresis == 1 else "_R"
        other_side = "_R" if paresis == 1 else "_L"
    else:
        errors["STROKE_HEMISPHERE"] = (
            f"{lesion_hemisphere}: inconsistent or missing data; seek clarification"
        )
        return errors

    # Define columns to check
    columns_to_check = [
        "FMUE_TOTAL",
        "FMUE_ARM",
        "FMUE_WRIST",
        "FMUE_HAND",
        "FMUE_REFLEX",
        "FMUE_HANDREFLEX",
        "FMUE_HANDWRIST",
        "ARAT_TOTAL",
        "ARAT_GRIP",
        "ARAT_GRASP",
        "ARAT_PINCH",
        "ARAT_GROSS",
        "SAFE",
    ]

    for col_base in columns_to_check:
        col = f"{col_base}{side}_SUM"
        col_other = f"{col_base}{other_side}_SUM"
        if col in row.index and col_other in row.index:
            val_col = row[col]
            val_col_other = row[col_other]

            # Convert values to numeric, coercing errors to NaN
            val_col_numeric = pd.to_numeric(val_col, errors="coerce")
            val_col_other_numeric = pd.to_numeric(val_col_other, errors="coerce")

            # Check if both values are numeric
            if pd.notnull(val_col_numeric) and pd.notnull(val_col_other_numeric):
                if val_col_numeric > val_col_other_numeric:
                    errors[col] = (
                        f"{val_col}: possible L/R switch (compare to {val_col_other})"
                    )
                if val_col_numeric == 0 and val_col_other_numeric == 0:
                    errors[col] = (
                        f"{val_col}: both hemispheres have values of 0: possible missing values"
                    )
            else:
                # Handle cases where values are non-numeric or missing
                if pd.isnull(val_col_numeric):
                    errors[col] = f'Value "{val_col}" is not numeric or missing.'
                if pd.isnull(val_col_other_numeric):
                    errors[col_other] = (
                        f'Value "{val_col_other}" is not numeric or missing.'
                    )
        else:
            continue

    return errors


def check_arat_rules(row):
    """
    Checks ARAT rules and returns errors if any.
    """
    errors = {}
    for side in ["_L", "_R"]:
        first_item = "ARAT_CMBLOCK10" + side
        if first_item in row.index and pd.notnull(row[first_item]):
            if int(row[first_item]) == 3:
                subsequent_items = [
                    "CMBLOCK25",
                    "CMBLOCK5",
                    "CMBLOCK75",
                    "CRICKETBALL",
                    "SHARPENINGSTONE",
                ]
                for val in subsequent_items:
                    col = "ARAT_" + val + side
                    if col in row.index and pd.notnull(row[col]):
                        if int(row[col]) != 3:
                            errors[col] = (
                                f"{row[col]}: should be 3 since first item is 3"
                            )

        # Add other ARAT rule checks as needed

    return errors


def validate_subject_row(row, validator):
    """
    Validates a subject row and returns a dictionary of errors.
    """
    totalErrors = {}
    print(row)
    print("validate_qc_required", validate_qc_required(row, validator))
    # Validation 1: Range and level checks
    errors1 = validate_row_with_validator(row, validator)

    # Validation 2: Hemisphere consistency
    errors2 = check_hemisphere_consistency(row)

    # Validation 3: ARAT rules
    errors3 = check_arat_rules(row)

    totalErrors.update(errors1)
    totalErrors.update(errors2)
    totalErrors.update(errors3)
    return totalErrors


def validate_qc_required(row, validator):
    """
    Simplified validation function that returns True if any validation fails.
    """
    # Use the same validation functions but return early if any errors are found
    if validate_row_with_validator(row, validator):
        return True
    if check_hemisphere_consistency(row):
        return True
    if check_arat_rules(row):
        return True
    return False


def fetch_qc_data():
    # Read the validator once outside the validation function
    validator = pd.read_csv(
        f"{working_dir}/faculty/sliew/enigma/new/Mahir/GBH_scripts/behavior/gbh_values_validation.csv"
    )

    filtered_df = aggregate_csv_files_from_log()

    # Use partial to fix the validator argument
    validate_func = partial(validate_qc_required, validator=validator)

    # Apply the validation function
    filtered_df["QC_REQUIRED"] = filtered_df.apply(validate_func, axis=1)
    filtered_df = filtered_df[["BIDS_ID", "SES", "SITE", "QC_REQUIRED"]]
    return filtered_df.to_json(orient="records")


def fetch_qc_pdf_data():
    # Load pdf_skeleton once
    with open(os.path.join(os.getcwd(), "pdf.json"), "r") as f:
        pdf_skeleton = json.load(f)
    return pdf_skeleton


def replace_placeholders(data, df):
    """
    Recursively replaces placeholders in the data structure with values from the DataFrame.
    """
    if isinstance(data, dict):
        # Iterate through dictionary and replace placeholders
        for key, value in data.items():
            data[key] = replace_placeholders(value, df)

    elif isinstance(data, list):
        # Process each element in the list
        data = [replace_placeholders(item, df) for item in data]

    elif isinstance(data, str):
        # Handle strings that might contain placeholders
        placeholders = re.findall(r"<<(.+?)>>", data)
        for placeholder in placeholders:
            if placeholder in df.columns:
                data = data.replace(
                    f"<<{placeholder}>>", str(df[placeholder].values[0])
                )

    return data


def fetch_pdf_data(bids_id, ses_id):
    df = get_subject_pdf_data(bids_id, ses_id)
    validator = pd.read_csv(
        f"{working_dir}/faculty/sliew/enigma/new/Mahir/GBH_scripts/behavior/gbh_values_validation.csv"
    )
    if df.empty:
        # Handle the case where no data is found
        return {"error": "No data found for the given BIDS_ID and SES_ID."}

    # Ensure df has only one row
    if len(df) > 1:
        # Handle the case where multiple entries are found
        # For now, we'll just take the first one
        df = df.iloc[[0]]

    row = df.iloc[0]
    errors = validate_subject_row(row, validator)

    qc_pdf_data = fetch_qc_pdf_data()
    # qc_pdf_data = replace_placeholders(qc_pdf_data, df)
    qc_pdf_data["visit"] = ses_id[-1]
    df.fillna("", inplace=True)
    res = {
        "blueprint": qc_pdf_data,
        "data": df.to_dict(orient="records")[0],
        "errors": errors,
    }
    return res


def update_qc_csv_data(bids_id, ses_id, data):
    try:
        timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
        root_directory = (
            f"{working_dir}/faculty/sliew/enigma/new/GBH/BIDS/derivatives/behavior/qc"
        )
        # root_directory = f'/Users/laharireddy/NPNL/PDF_examples'
        qc_dir = get_latest_qc_dir(root_directory)
        print(data)
        skeleton_path = os.path.join(qc_dir, "blueprint.csv")
        df = pd.read_csv(skeleton_path, index_col=False)
        for column, value in data.items():
            print(column)
            if column in df.columns:
                df[column] = [value]

        df.fillna("", inplace=True)
        file_name = f"{bids_id}_{ses_id}_{timestamp}"

        log_file_path = os.path.join(qc_dir, "log_all_behavior.csv")
        log_df = pd.read_csv(log_file_path, index_col=False)
        new_row = {
            "BIDS_ID": bids_id,
            "SES": ses_id,
            "Timestamp": timestamp,
            "File_Name": file_name + ".csv",
        }
        new_row_df = pd.DataFrame([new_row])
        log_df = pd.concat([log_df, new_row_df], ignore_index=True)
        print(df)
        df.to_csv(os.path.join(qc_dir, file_name + ".csv"), index=False)
        log_df.to_csv(log_file_path, index=False)

        return True
    except Exception as e:
        print(e)
        return False
    

def get_data_request_admins_list():
    """Get list of data request admin emails from S3"""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name="us-east-1",
    )
    try:
        obj = s3.get_object(Bucket=DATA_REQUEST_ADMINS_BUCKET, Key=DATA_REQUEST_ADMINS_KEY)
        data = obj["Body"].read().decode("utf-8").splitlines()
        reader = csv.DictReader(data)
        admins = [row["email"] for row in reader]
        return admins
    except s3.exceptions.NoSuchKey:
        # File doesn't exist yet, return empty list
        return []
    except Exception as e:
        print(f"Error reading admins from S3: {e}")
        return []
    
def save_data_request_admins_list(admins):
    """Save list of data request admin emails to S3"""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name="us-east-1",
    )
    
    # Create CSV content
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=["email"])
    writer.writeheader()
    for email in admins:
        writer.writerow({"email": email})
    
    # Upload to S3
    s3.put_object(
        Bucket=DATA_REQUEST_ADMINS_BUCKET,
        Key=DATA_REQUEST_ADMINS_KEY,
        Body=output.getvalue().encode("utf-8")
    )

def get_data_request_admins(request):
    """Get list of all data request admins"""
    try:
        admins = get_data_request_admins_list()
        return jsonify({"admins": admins}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def add_data_request_admin(request):
    """Add a new data request admin"""
    try:
        data = json.loads(request.data)
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Get current admins
        admins = get_data_request_admins_list()
        
        # Check if admin already exists
        if email in admins:
            return jsonify({"error": "Admin already exists"}), 400
        
        # Add new admin
        admins.append(email)
        save_data_request_admins_list(admins)
        
        return jsonify({"message": f"Admin {email} added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def delete_data_request_admin(request):
    """Delete a data request admin"""
    try:
        data = json.loads(request.data)
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Get current admins
        admins = get_data_request_admins_list()
        
        # Check if admin exists
        if email not in admins:
            return jsonify({"error": "Admin not found"}), 404
        
        # Remove admin
        admins.remove(email)
        save_data_request_admins_list(admins)
        
        return jsonify({"message": f"Admin {email} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

