from flask import (
    Flask,
    render_template,
    send_from_directory,
    request,
    jsonify,
    session,
    url_for,
    Response,
)
from flask_cors import CORS, cross_origin  # Import CORS
import json, os
from utils import (
    #fetch_data,
    get_filtered_rows_count,
    add_data_request,
    get_request_data_from_storage,
    get_requests,
    #get_summarized_data,
    send_email,
    get_boolean_data_from_file,
    get_authors_list,
    get_formatted_authors_response,
    fetch_pdf_data,
    fetch_qc_data,
    update_qc_csv_data,
    get_data_request_admins_list,
    save_data_request_admins_list,
    get_data_request_admins,
    add_data_request_admin,
    delete_data_request_admin,
)
import collaborators_utils 


app_mode = os.getenv("FLASK_APP_MODE", "user")
application = Flask(__name__, static_folder="static/build")
# CORS(application, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(application)


@application.route("/config", methods=["GET"])
@cross_origin()
def get_config():
    return jsonify({"mode": app_mode}), 200

'''
@application.route("/view", methods=["POST"])
@cross_origin()
@collaborators_utils.authenticate
def view_data():
    data = request.data
    filters = json.loads(data)
    result = fetch_data(filters["data"])
    if result["success"]:
        if "data" in result:
            return jsonify(
                {
                    "status": "success",
                    "data": result["data"],
                    "redirect_url": url_for("display"),
                }
            )
        else:
            return jsonify({"status": "success"})
    else:
        error_message = result.get("error", "An error has occurred")
        return jsonify({"error": error_message}), 500


@application.route("/download", methods=["POST"])
@cross_origin()
@collaborators_utils.authenticate
def download_data():
    data = request.data
    filters = json.loads(data)
    result = fetch_data(filters["data"], download=True)
    if result["success"] and "data" in result:
        csv = result["data"]
        response = Response(csv, mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=data.csv"
        return response
    elif result["success"]:
        return Response(
            json.dumps({"error": "No data was fetched"}),
            status=404,
            mimetype="application/json",
        )
    else:
        error_message = result.get("error", "An error has occurred")
        return Response(
            json.dumps({"error": error_message}),
            status=500,
            mimetype="application/json",
        )
'''

@application.route("/auth/check", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def check_authorization():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.check_user_authorization(request)

@application.route("/rows-count", methods=["POST", "OPTIONS"])
@cross_origin()
def get_rows_count():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    filters = json.loads(request.data)
    result = get_filtered_rows_count(application.static_folder, filters)

    if result["success"]:
        return jsonify({
            "success": True,
            "count": result.get("count", 0),
            "total_sites": result.get("total_sites", 0),
            "sessions_per_site": result.get("sessions_per_site", {}),
        }), 200
    return jsonify({"error": "Error"}), 500


@application.route("/boolean-data", methods=["GET", "OPTIONS"])
@cross_origin()
def get_boolean_data():
    if request.method == "OPTIONS":
        # Specific handling for preflight request if needed
        return _build_cors_preflight_response()
    staticPath = application.static_folder
    result = get_boolean_data_from_file(staticPath)
    return result
#BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#METRICS_FILE = os.path.join(BASE_DIR, "metric-scripts", "metrics_data.json")

@application.route("/metrics", methods=["GET", "OPTIONS"])
@cross_origin()
def get_metrics():
    #file_path = application.static_folder + "/anonymized_data/metrics_data.json"
    #print("Reading metrics from:", file_path)
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    try:
        with open(application.static_folder + "/anonymized_data/metrics_data.json", "r") as file:
        #with open(METRICS_FILE, "r") as file:
            all_metrics = json.loads(file.read())
            #behavioral_data = json.loads(file.read())
            behavioral_data = {}
            imaging_data = {}
            for category, subcategories in all_metrics.items():
                if category == 'Modality':
                        continue
                if(
                    category.startswith(('Imaging', 'Image')) or 
                    category in ['Lesion Information']
                ):
                    imaging_data[category] = subcategories
                else:
                    behavioral_data[category] = subcategories
            data = {
                "behavioral": behavioral_data,
                "imaging": imaging_data
            }
        return data, 200
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

# Data Request Admin Management Routes
@application.route("/data-request/admins", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_data_request_admins_route():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return get_data_request_admins(request)

@application.route("/data-request/admins", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def add_data_request_admin_route():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return add_data_request_admin(request)

@application.route("/data-request/admins", methods=["DELETE", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def delete_data_request_admin_route():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return delete_data_request_admin(request)



@application.route("/get-results", methods=["GET"])
@cross_origin()
def get_results():
    if "result_data" in session:
        return jsonify(session["result_data"])
    return jsonify({"error": "No data found"}), 404


@application.route("/submit-request", methods=["POST"])
@cross_origin()
def submit_request():
    data = json.loads(request.data)
    response = add_data_request(data)
    if response["success"]:
        admin_email = "sarza@usc.edu"
        requestor_name = data["requestor"]["name"]
        file_name = response.get("filename", "Unknown_File.json")
        subject = f"[NPNL Enigma] New Data Request from {requestor_name}"
        body = (
                f"Hello,\n\n"
                f"{requestor_name} has submitted a new data request.\n"
                f"Please refer to '{file_name}' in the S3 bucket to view the request details.\n\n"
        )
        send_email(admin_email, subject, body)
        return jsonify({"status": "success", "message": response["message"]}), 200
    else:
        return (
            jsonify(
                {
                    "error": "There was an error submitting your request",
                    "message": response["message"],
                }
            ),
            500,
        )

@application.route("/get-requests", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def fetch_requests():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    files_data = get_requests()
        #print(files_data)
    return jsonify(files_data), 200

@application.route("/collaborators/pis-by-cohort", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_pis_by_cohort_route():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    cohort_pi_map = collaborators_utils.get_pis_by_cohort()
    return jsonify(cohort_pi_map), 200

@application.route("/collaborators/download-csv", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def download_collaborators_csv():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    download_collab_csv = collaborators_utils.download_collaborators_csv(request)
    return download_collab_csv

@application.route("/get-request/<filename>")
@cross_origin()
@collaborators_utils.authenticate
def get_request_data(filename):
    data = get_request_data_from_storage(filename)
    return data, 200

'''
@application.route("/data-summary", methods=["POST"])
@cross_origin()
@collaborators_utils.authenticate
def get_data_and_summary():
    response = {}
    data = json.loads(request.data)
    response = get_summarized_data(data)
    json_data = json.dumps(response, default=str)
    return json_data, 200


@application.route("/data-summary/<filename>")
@cross_origin()
@collaborators_utils.authenticate
def get_data_and_summary_by_filename(filename):
    response = {}
    data_request = get_request_data_from_storage(filename)
    response = get_summarized_data(data_request["data"])
    json_data = json.dumps(response, default=str)
    return json_data, 200
'''

@application.route("/send-email", methods=["GET"])
@cross_origin()
def send_email_to():
    print("sending")
    response = send_email("mhkhan@usc.edu")
    return jsonify({"error": "Invalid operation", "response": response}), 200


@application.route("/get-authors-list", methods=["GET", "OPTIONS"])
@cross_origin()
def fetch_authors_list():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    if app_mode == "admin":
        response = get_authors_list()
        # json_data = json.dumps(response, default=str)
        return response["data"], 200
    else:
        return jsonify({"error": "Invalid operation"}), 401


@application.route("/formatted-authors", methods=["POST", "OPTIONS"])
@cross_origin()
def get_formatted_authors():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    if app_mode == "admin":
        request_data = json.loads(request.data)
        response_txt = get_formatted_authors_response(request_data)
        return jsonify({"formattedAuthors": response_txt}), 200


@application.route("/qc-pdf-data/<bids_id>/<ses_id>", methods=["GET"])
@cross_origin()
def get_qc_pdf(bids_id, ses_id):
    return fetch_pdf_data(bids_id, ses_id)


@application.route("/qc-data", methods=["GET"])
@cross_origin()
def get_qc_subjects_data():
    return fetch_qc_data(), 200


@application.route("/qc-pdf-data/<bids_id>/<ses_id>", methods=["POST"])
@cross_origin()
def update_qc_data(bids_id, ses_id):
    data = json.loads(request.data)
    res = update_qc_csv_data(bids_id, ses_id, data)
    if res:
        return jsonify({"success": True}), 200
    return jsonify({"success": False}), 500

@application.route("/collaborators/get_user_details", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_user_details():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.get_user_details(request)


@application.route("/collaborators/update_user_details", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def update_user_details():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.update_user_details(request)

@application.route("/collaborators/delete_collaborator", methods=["DELETE", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def delete_collaborator():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.delete_collaborator(request)

@application.route("/collaborators/add_collaborator", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def add_collaborator():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.add_collaborator(request)

@application.route("/collaborators/get_all_collaborators", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_all_collaborators():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.get_all_collaborators(request)

@application.route("/collaborators/get_user_by_index", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_user_by_index():
    return collaborators_utils.get_user_by_index(request)

@application.route("/collaborators/get_current_user_role", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_current_user_role():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.get_current_user_role(request)

@application.route("/collaborators/send_invite_email", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def send_invite_email():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.send_invite_email(request)

@application.route("/collaborators/upload_profile_picture", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def upload_profile_picture():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.upload_profile_picture(request)

@application.route("/collaborators/delete-profile-picture", methods=["DELETE", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def delete_profile_picture():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.delete_profile_picture(request)

@application.route("/collaborators/check_collaborator_by_email", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def check_collaborator_by_email():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.check_collaborator_by_email(request)

@application.route("/collaborators/get_admins", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def get_admins():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.get_admins(request)

@application.route("/collaborators/add_admin", methods=["POST", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def add_admin():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.add_admin(request)

@application.route("/collaborators/delete_admin", methods=["DELETE","OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def delete_admin():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.delete_admin(request)

@application.route("/collaborators/check_admin_status", methods=["GET", "OPTIONS"])
@cross_origin()
@collaborators_utils.authenticate
def check_admin_status():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    return collaborators_utils.check_admin_status(request)


def _build_cors_preflight_response():
    response = jsonify({"status": "success"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Max-Age", "10000")
    response.headers.add(
        "Access-Control-Allow-Headers", "Content-Type,Authorization, X-Requested-With"
    )
    return response

@application.route("/", defaults={"path": ""})
@application.route("/<path:path>")
@cross_origin()
def form(path):
    if path != "" and os.path.exists(os.path.join(application.static_folder, path)):
        return send_from_directory(application.static_folder, path)
    else:
        return send_from_directory(application.static_folder, 'index.html')

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=5000, debug=True)
