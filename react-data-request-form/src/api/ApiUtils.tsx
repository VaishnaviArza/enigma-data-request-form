import {
  DataRequestsResponse,
  DataRequestIn,
  DataRequestOut,
} from "../types/DataRequest";
import {
  AuthorsOptions,
  DataFrame,
  DataSummaries,
  Dictionary,
  FetchDataResponse,
  FormattedAuthorsRequest,
  FormattedAuthorsResponse,
  pdfData,
  QCDataResponse,
} from "../types/DataTypes";
import HttpClient from "./HttpClient";
import axios from "axios";


const checkUserAuthorization = async (token: string | null) => {
  const response = await HttpClient.get<{
    authorized: boolean;
    is_admin: boolean;
    is_collaborator: boolean;
    can_access_collaborators_console: boolean;
    can_access_data_request: boolean;
    is_active?: boolean;
    user_details?: any;
    message?: string;
  }>("auth/check", token);
  return response;
};

const fetchRequests = async (token: string | null) => {
  const requests = await HttpClient.get<DataRequestIn[]>("get-requests", token);
  // console.log(requests)
  return requests;
};

const submitRequest = async (data: DataRequestOut) => {
  const response = await HttpClient.post<Response>("submit-request", data);
  return response;
};

const fetchRequest = async (fileName: string, token: string | null) => {
  const dataRequest = await HttpClient.get<DataRequestIn>(
    `get-request/${fileName}`, token
  );
  return dataRequest;
};

const getData = async (data: DataRequestOut) => {
  const response = await HttpClient.post<FetchDataResponse>("view", data);
  return response;
};

//const fetchDataAndSummary = async (data: DataRequestOut, token: string | null) => {
//  const response = await HttpClient.post<DataSummaries>("data-summary", data, token);
//  return response;
//};

//const fetchDataAndSummaryByFilename = async (fileName: string, token: string | null) => {
//  const response = await HttpClient.get<DataSummaries>(
//    `data-summary/${fileName}`,
//    token
//  );
//  return response;
//};

const fetchBooleanData = async () => {
  const response = await HttpClient.get<DataFrame>("boolean-data");
  return response;
};

const getRowCount = async (filters: any) => {
  const response = await HttpClient.post<{
    success: boolean;
    count: number;
    total_sites: number;
    sessions_per_site: { [site: string]: number };
    message?: string;
  }>("rows-count", filters);
  return response;
};

const fetchAuthorsData = async () => {
  const response = await HttpClient.get<AuthorsOptions>("get-authors-list");
  return response;
};

const fetchFormattedAuthors = async (
  formattedAuthorsRequest: FormattedAuthorsRequest
) => {
  const response = await HttpClient.post<FormattedAuthorsResponse>(
    "formatted-authors",
    formattedAuthorsRequest
  );
  return response;
};

const fetchQCSubjectsData = async () => {
  const response = await HttpClient.get<DataFrame>("qc-data");
  return response;
};

const fetchPDFData = async (bidsId: string, sesId: string) => {
  const response = await HttpClient.get<QCDataResponse>(
    `qc-pdf-data/${bidsId}/${sesId}`
  );
  return response;
};

const updateQCData = async (
  bidsId: string,
  sesId: string,
  data: Dictionary<string | number>
) => {
  const response = await HttpClient.post<Response>(
    `qc-pdf-data/${bidsId}/${sesId}`,
    data
  );
  return response;
};

const checkCollabAdminStatus = async (token: string | null) => {
  const response = await HttpClient.get<any>(
    `collaborators/check_admin_status`,
    token
  )
  return response
}

const getCurrentUserRole = async (token: string | null) => {
  const response = await HttpClient.get<any>(
    `collaborators/get_current_user_role`,
    token
  );
  return response;
};

const fetchCollabAdmin = async (token: string | null) => {
  const response = await HttpClient.get<any>(
    `collaborators/get_admins`,
    token
  )
  return response
}

const deleteCollabAdmin = async (token: string | null, email: string) => {
  const response = await HttpClient.delete<any>(
    `collaborators/delete_admin`,
    {'email': email}, 
    token
  )
  return response
}

const addCollabAdmin = async (token: string | null, email: string) => {
  const response = await HttpClient.post<any>(
    `collaborators/add_admin`,
    {'email': email}, 
    token
  )
  return response
}

const addCollaborator = async (token: string | null, data: any) => {
  const response = await HttpClient.post<any>(
    `collaborators/add_collaborator`,
    data,
    token
  )
  return response
}

const updateCollabUserDetails = async (token: string | null, data: any) => {
  const response = await HttpClient.post<any>(
    `collaborators/update_user_details`,
    data,
    token
  )
  return response
}

const deleteCollaborator = async (token: string | null, index: string) => {
  const response = await HttpClient.delete<any>(
    `collaborators/delete_collaborator`,
    { index: index },  // Send as object with index property
    token
  )
  return response
}

const fetchCollaborators = async (token: string | null) => {
  const response = await HttpClient.get<any>(
    `collaborators/get_all_collaborators`,
    token
  )
  return response
}

const fetchCollabUserDetails = async (token: string | null) => {
  const response = await HttpClient.get<any>(
    `collaborators/get_user_details`,
    token
  )
  return response
}

const fetchCollaboratorByIndex = async (token: string, index: string) => {
  return await HttpClient.get<any>(
    `collaborators/get_user_by_index?index=${index}`,
    token
  );
};

const checkCollaboratorByEmail = async (token: string | null, email: string) => {
  const response = await HttpClient.get<any>(
    `collaborators/check_collaborator_by_email?email=${encodeURIComponent(email)}`,
    token
  );
  return response;
};

const sendInviteEmail = async (token: string | null, email: string, senderName?: string) => {
  const response = await HttpClient.post<any>(
    `collaborators/send_invite_email`,
    { email, sender_name: senderName },
    token
  );
  return response;
};

const uploadProfilePicture = async (token: string | null, imageData: string, userIndex?: string) => {
  const response = await HttpClient.post<any>(
    `collaborators/upload_profile_picture`,
    { 
      image: imageData,
      user_index: userIndex 
    },
    token
  );
  return response;
};

const getDataRequestAdmins = async (token: string | null) => {
  const response = await HttpClient.get<{ admins: string[] }>(
    "data-request/admins",
    token
  );
  return response;
};

const addDataRequestAdmin = async (token: string | null, email: string) => {
  const response = await HttpClient.post<{ message: string }>(
    "data-request/admins",
    { email },
    token
  );
  return response;
};

const deleteDataRequestAdmin = async (token: string | null, email: string) => {
  const response = await HttpClient.delete<{ message: string }>(
    "data-request/admins",
    { email },
    token
  );
  return response;
};

const downloadCollaboratorsCSV = async (token: string | null) => {
  const response = await axios.get(
    `${HttpClient.baseUrl}/collaborators/download-csv`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob', // Important for file download
    }
  );
  return response.data;
};

const fetchPIsByCohort = async (token: string | null) => {
  const response = await HttpClient.get<{ [cohort: string]: Array<{ name: string; role: string }> }>(
    "collaborators/pis-by-cohort",
    token
  );
  return response;
};

const deleteProfilePicture = async (token: string | null, imageUrl: string) => {
  const response = await HttpClient.delete<{ message: string }>(
    "collaborators/delete-profile-picture",
    { image_url: imageUrl },
    token
  );
  return response;
};



export default {
  fetchRequests,
  // getData,
  submitRequest,
  fetchRequest,
  //fetchDataAndSummary,
  //fetchDataAndSummaryByFilename,
  fetchBooleanData,
  getRowCount,
  fetchAuthorsData,
  fetchFormattedAuthors,
  fetchQCSubjectsData,
  fetchPDFData,
  updateQCData,
  checkCollabAdminStatus,
  fetchCollabAdmin,
  deleteCollabAdmin,
  addCollabAdmin,
  addCollaborator,
  updateCollabUserDetails,
  deleteCollaborator,
  fetchCollaborators,
  fetchCollabUserDetails,
  checkCollaboratorByEmail,
  sendInviteEmail,
  fetchCollaboratorByIndex,
  getCurrentUserRole,
  uploadProfilePicture,
  getDataRequestAdmins,
  addDataRequestAdmin,
  deleteDataRequestAdmin,
  checkUserAuthorization,
  fetchPIsByCohort,
  downloadCollaboratorsCSV,
  deleteProfilePicture,
};
