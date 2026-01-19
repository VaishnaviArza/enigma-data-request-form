import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { getCurrentUserToken } from "../../services/authService";
import {useDispatch} from 'react-redux';
import { showModal, hideModal } from "../../redux/modalSlice";
import ApiUtils from "../../api/ApiUtils";
import Select from "react-select";
import countryList from "react-select-country-list";
import ModalComponent from "../Modal/Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface CollaboratorDetailsProps {
  handleSubmit: () => void;
  dataFrame: { [key: string]: any };
  action: "add" | "update" | null;
  canDelete: boolean;
}

const CREDIT_ROLES = [
  { value: "Conceptualization", label: "Conceptualization" },
  { value: "Methodology", label: "Methodology" },
  { value: "Software", label: "Software" },
  { value: "Validation", label: "Validation" },
  { value: "Formal analysis", label: "Formal analysis" },
  { value: "Investigation", label: "Investigation" },
  { value: "Resources", label: "Resources" },
  { value: "Data Curation", label: "Data Curation" },
  { value: "Writing - Original Draft", label: "Writing - Original Draft" },
  { value: "Writing - Review & Editing", label: "Writing - Review & Editing" },
  { value: "Visualization", label: "Visualization" },
  { value: "Supervision", label: "Supervision" },
  { value: "Project administration", label: "Project administration" },
  { value: "Funding acquisition", label: "Funding acquisition" },
];

const DISCLOSURE_CATEGORIES = [
  { value: "", label: "Select category..." },
  { value: "competing_interest", label: "Competing Interest" },
  { value: "funding_source", label: "Funding Source" },
  { value: "employment", label: "Employment/Affiliation" },
  { value: "consulting", label: "Consulting Fees" },
  { value: "stock_ownership", label: "Stock Ownership" },
  { value: "patents", label: "Patents/Royalties" },
  { value: "other", label: "Other" },
];

const CollaboratorDetails: React.FC<CollaboratorDetailsProps> = ({
  handleSubmit,
  dataFrame,
  action,
  canDelete,
}) => {
  const dispatch = useDispatch();
  const [localDataFrame, setDataFrame] = useState<{ [key: string]: any } & { emails : string[] }>
  ({...dataFrame, emails: dataFrame.emails || [],});
  const [userRole, setUserRole] = useState<string>("");
  const [userCohorts, setUserCohorts] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [piLastName, setPiLastName] = useState<string>("");
  //const [cohortFundingAck, setCohortFundingAck] = useState<string>("");
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [formerMembers, setFormerMembers] = useState<any[]>([]);
  //const [contributingMembers, setContributingMembers] = useState<string[]>([]);
  const isUpdateMode = action === "update";
  const [initialDataFrame, setInitialDataFrame] = useState<any>(null);
  const [creditRoles, setCreditRoles] = useState<any[]>([]);
  const [allPIs, setAllPIs] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCohortForContributors, setSelectedCohortForContributors] = useState<string[]>([]);
  const [blanketOptIn, setBlanketOptIn] = useState<boolean>(false);
  const [cohortContributors, setCohortContributors] = useState<Array<{
    cohort: string;
    members: Array<{
      first_name: string;
      last_name: string;
      email: string;
      role: string;
      credit_roles: string[];
    }>;
  }>>([]);
  const [disclosures, setDisclosures] = useState<Array<{
    category: string;
    details: string;
  }>>([{ category: "", details: "" }]);
  const [cohortFunding, setCohortFunding] = useState<Array<{
    cohort: string;
    funding: string;
  }>>([]);

  useEffect(() => {
    const fetchPIs = async () => {
      try {
        const token = await getCurrentUserToken();
        const response = await ApiUtils.fetchCollaborators(token);
        
        // Filter for PIs and Co-PIs
        const pisList = response
          .filter((collab: any) => collab.role === "PI" || collab.role === "Co-PI")
          .map((pi: any) => ({
            value: pi.last_name,
            label: `${pi.first_name} ${pi.last_name}`,
          }));
        setAllPIs(pisList);
      } catch (error) {
        console.error("Error fetching PIs:", error);
      }
    };

    if (localDataFrame.role === "Member") {
      fetchPIs();
    }
  }, [localDataFrame.role]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = await getCurrentUserToken();
      try {
        const roleData = await ApiUtils.getCurrentUserRole(token);
        setUserRole(roleData.role);
        setUserCohorts(roleData.cohorts || []);
        setIsAdmin(roleData.is_admin);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    
    fetchUserRole();
  }, []);
  const canEditField = (fieldName: string): boolean => {
    if (isAdmin) return true;
    
    if (userRole === "PI" || userRole === "Co-PI") {
      // PI cannot edit cohort_enigma_list or role
      if (fieldName === "cohort_enigma_list" || fieldName === "role") {
        return false;
      }
      return true;
    }
    
    if (userRole === "Member") {
      // Member cannot edit cohort_enigma_list or role
      if (fieldName === "cohort_enigma_list" || fieldName === "role") {
        return false;
      }
      return true;
    }
    
    return false;
  };
  useEffect(() => {
    if (!dataFrame) return;
    setInitialDataFrame(dataFrame);
    setDataFrame({
      ...dataFrame,
      profile_picture: dataFrame.profile_picture || "",
      emails: dataFrame.email_list || [],
      orcid: dataFrame.orcid || "",
      degrees: dataFrame.degrees || [],
      cohort_enigma_list: dataFrame.cohort_enigma_list || [],
      cohort_orig_list: dataFrame.cohort_orig_list || [],
      pi_last_name: dataFrame.pi_last_name || "",
      role: dataFrame.role || "",
      blanket_opt_in: dataFrame.blanket_opt_in || "",
      //credit_roles: dataFrame.credit_roles || [],
    });
    if (dataFrame.profile_picture) {
      setProfilePicture(dataFrame.profile_picture);
      setPreviewUrl(dataFrame.profile_picture);
    }
    setBlanketOptIn(dataFrame.blanket_opt_in === "yes");

    // load degrees dropdown
    if (dataFrame.degrees) {
      setDegreeOptionsSelected(
        dataFrame.degrees.map((d: string) => ({ value: d, label: d }))
      );
    }

    if (dataFrame.cohort_contributors && Array.isArray(dataFrame.cohort_contributors)) {
      setCohortContributors(dataFrame.cohort_contributors);
      const cohortsWithContributors = dataFrame.cohort_contributors
        .map((item: any) => item.cohort)
        .filter((cohort: string) => cohort);
      if (cohortsWithContributors.length > 0) {
        setSelectedCohortForContributors(cohortsWithContributors);
      }
    } else {
      setCohortContributors([]);
      setSelectedCohortForContributors([]);
    }
    //setContributingMembers(dataFrame.contributing_members || []);
    // Load ALL institutions from the list fields
    const loadedInstitutions = [];
    const maxLength = Math.max(
      dataFrame.department_list?.length || 0,
      dataFrame.university_list?.length || 0,
      dataFrame.address_list?.length || 0,
      dataFrame.city_list?.length || 0,
      dataFrame.state_list?.length || 0,
      dataFrame.country_list?.length || 0
    );

    for (let i = 0; i < maxLength; i++) {
      loadedInstitutions.push({
        department: dataFrame.department_list?.[i] || "",
        university: dataFrame.university_list?.[i] || "",
        address: dataFrame.address_list?.[i] || "",
        city: dataFrame.city_list?.[i] || "",
        state: dataFrame.state_list?.[i] || "",
        country: dataFrame.country_list?.[i] || "",
      });
    }

    // If no institutions exist, start with one empty institution
    if (loadedInstitutions.length === 0) {
      loadedInstitutions.push({
        department: "",
        university: "",
        address: "",
        city: "",
        state: "",
        country: "",
      });
    }

    setInstitutions(loadedInstitutions);
    setActiveMembers(dataFrame.active_members || []);
    setFormerMembers(dataFrame.former_members || []);
    setPiLastName(dataFrame.pi_last_name || "");
    //setCohortFundingAck(dataFrame.cohort_funding_ack || "");
    if (dataFrame.cohort_funding && Array.isArray(dataFrame.cohort_funding)) {
      setCohortFunding(dataFrame.cohort_funding);
    } else {
      setCohortFunding([]);
    }
    //setContributingMembers(dataFrame.contributing_members || []);
    const cleanedFunding = (dataFrame.funding_ack || [])
      .flat()
      .map((item: any) => String(item || ''))
      .filter((item: string) => item.trim());
    setFunding(
      cleanedFunding.length > 0 ? cleanedFunding : ['']
    );
    const cleanedDisclosures = (dataFrame.disclosures || [])
      .flat(Infinity)
      .filter((item: any) => typeof item === 'string' && item.trim());
    if (cleanedDisclosures.length > 0) {
      const parsedDisclosures = cleanedDisclosures.map((disc: string) => {
        try {
          const parsed = JSON.parse(disc);
          if (parsed.category && parsed.details) {
            return parsed;
          }
        } catch (e) {

        }
        return { category: "other", details: disc };
      });
      setDisclosures(parsedDisclosures);
    } else {
      setDisclosures([{ category: "", details: "" }]);
    }
  }, [dataFrame]);
  // ⭐ ADD THIS NEW USEEFFECT - Sync blanketOptIn to localDataFrame
  useEffect(() => {
    setDataFrame((prev) => ({
      ...prev,
      blanket_opt_in: blanketOptIn ? "yes" : "",
    }));
  }, [blanketOptIn]);
  //const [countryOption, setCountryOption] = useState<{ label: string; value: string } | null>(null);
  const degreeOptions = [
    { value: "BA", label: "BA" },
    { value: "BS", label: "BS" },
    { value: "MA", label: "MA" },
    { value: "MS", label: "MS" },
    { value: "MD", label: "MD" },
    { value: "PhD", label: "PhD" },
    { value: "MPH", label: "MPH" },
    { value: "MBA", label: "MBA" },
  ];
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      dispatch(
        showModal({
          title: "File Too Large",
          message: "Please select an image smaller than 2MB.",
          modalType: "error",
        })
      );
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      dispatch(
        showModal({
          title: "Invalid File Type",
          message: "Please select an image file (JPG, PNG, GIF, etc.).",
          modalType: "error",
        })
      );
      return;
    }
    dispatch(
      showModal({
        title: "Uploading...",
        message: "Please wait while your image is being uploaded.",
        modalType: "loading",
      })
    );

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      try {
      // Upload to S3
        const token = await getCurrentUserToken();
        const response = await ApiUtils.uploadProfilePicture(
          token, 
          base64String,
          localDataFrame.index // Pass index for unique filename
        );
        const imageUrl = response.url;
        setProfilePicture(imageUrl);
        setDataFrame({
          ...localDataFrame,
          profile_picture: imageUrl,
        });
        dispatch(hideModal());
        dispatch(
          showModal({
            title: "Upload Success",
            message: "Profile picture uploaded successfully!",
            modalType: "success",
          })
        );
      } catch (error) {
        console.error("Error uploading picture:", error);
        setPreviewUrl("");
        dispatch(
          showModal({
            title: "Upload Failed",
            message: "Failed to upload profile picture. Please try again.",
            modalType: "error",
          })
        );
      }
    };
    reader.onerror = () => {
      dispatch(
        showModal({
          title: "Error",
          message: "Failed to read the image file.",
          modalType: "error",
        })
      );
    };
    reader.readAsDataURL(file);
    };

  const handleRemoveImage = async () => {
    try {
      const token = await getCurrentUserToken();
      const currentImageUrl = profilePicture || localDataFrame.profile_picture;
      
      // Delete from S3 if there's an image
      if (currentImageUrl) {
        try {
          await ApiUtils.deleteProfilePicture(token, currentImageUrl);
          console.log("Image deleted from S3");
        } catch (error) {
          console.error("Error deleting image from S3:", error);
          // Continue anyway to clear from profile
        }
      }
      
      // Clear from state
      setProfilePicture("");
      setPreviewUrl("");
      setDataFrame({
        ...localDataFrame,
        profile_picture: "",
      });
      
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside any droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same list at the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    // Moving within the same list (reordering)
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'active-members') {
        const newActiveMembers = Array.from(activeMembers);
        const [removed] = newActiveMembers.splice(source.index, 1);
        newActiveMembers.splice(destination.index, 0, removed);
        setActiveMembers(newActiveMembers);
      } else {
        const newFormerMembers = Array.from(formerMembers);
        const [removed] = newFormerMembers.splice(source.index, 1);
        newFormerMembers.splice(destination.index, 0, removed);
        setFormerMembers(newFormerMembers);
      }
      return;
    }

    // Moving between different lists
    if (source.droppableId === 'active-members' && destination.droppableId === 'former-members') {
      // Moving from Active to Former
      const newActiveMembers = Array.from(activeMembers);
      const newFormerMembers = Array.from(formerMembers);
      const [removed] = newActiveMembers.splice(source.index, 1);
      newFormerMembers.splice(destination.index, 0, removed);
      setActiveMembers(newActiveMembers);
      setFormerMembers(newFormerMembers);
    } else if (source.droppableId === 'former-members' && destination.droppableId === 'active-members') {
      // Moving from Former to Active
      const newActiveMembers = Array.from(activeMembers);
      const newFormerMembers = Array.from(formerMembers);
      const [removed] = newFormerMembers.splice(source.index, 1);
      newActiveMembers.splice(destination.index, 0, removed);
      setActiveMembers(newActiveMembers);
      setFormerMembers(newFormerMembers);
    }
  };
  const [degreeOptionsSelected, setDegreeOptionsSelected] = useState<
    { value: string; label: string }[]
  >([]);
  const countryOptions = useMemo(() => countryList().getData(), []);
  const [errors, setErrors] = useState({ emails: "", orcid: "", });
  const [institutions, setInstitutions] = useState([
  { department: "", university: "", address:"", city: "", state: "", country: "" },]);
  const AnySelect: any = Select;
  const [newMember, setNewMember] = useState({
  first_name: "",
  MI: "",
  last_name: "",
  email: "",
  role: "",
  });
  useEffect(() => {
    const fetchRole = async () => {
      if (!newMember.email || !validateEmail(newMember.email)) return;

      try {
        const token = await getCurrentUserToken();
        const existing = await ApiUtils.checkCollaboratorByEmail(token, newMember.email);

        if (existing.exists) {
          setNewMember((prev) => ({
            ...prev,
            role: existing.role
          }));
        } else {
          setNewMember((prev) => ({
            ...prev,
            role: "Member"
          }));
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };

    fetchRole();
  }, [newMember.email]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [funding, setFunding] = useState<string[]>([""]);
  //const [disclosures, setDisclosures] = useState<string[]>([""]);

  /*
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = await getCurrentUserToken();
        const response = await ApiUtils.fetchCollaborators(token);
        setCurrentMembers(response.current || []);
        setPreviousMembers(response.previous || []);
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      }
    };
    fetchMembers();
  }, []); */
  const handleAddMemberClick = () => {
    setShowAddMemberModal(true);
  };
  const handleAddMemberSubmit = async () => {
    try {
      if (!newMember.email || !validateEmail(newMember.email)) {
        dispatch(
          showModal({
            title: "Invalid Email",
            message: "Please enter a valid email address.",
            modalType: "error",
          })
        );
        return;
      }
      const token = await getCurrentUserToken();
      const existing = await ApiUtils.checkCollaboratorByEmail(token, newMember.email);
      const piLastName = localDataFrame.last_name;
      if (existing.exists) {
        // Check if already in current members
        const alreadyAdded = activeMembers.some(
          (m) => m.email.toLowerCase() === existing.email.toLowerCase()
        );
        if (alreadyAdded) {
          dispatch(
            showModal({
              title: "Already Added",
              message: `${existing.first_name} ${existing.last_name} is already in Current Members.`,
              modalType: "error",
            })
          );
          setShowAddMemberModal(false);
          setNewMember({ first_name: "", MI: "", last_name: "", email: "", role: existing.role || "Member" });
          return;
        }
        try {
          await ApiUtils.updateCollabUserDetails(token, {
            index: existing.index,
            pi_last_name: piLastName,
          });
          console.log(`Updated pi_last_name for ${existing.email} to ${piLastName}`);
        } catch (error) {
          console.error("Error updating member's pi_last_name:", error);
          // Continue anyway - we'll still add them to active members locally
        }
        const memberToAdd = {
          first_name: existing.first_name,
          last_name: existing.last_name,
          email: existing.email,
          role: existing.role,
        };
        setActiveMembers((prev) => [...prev, memberToAdd]);

        dispatch(
          showModal({
            title: "Member Added",
            message: `${existing.first_name} ${existing.last_name} added to Current Members.`,
            modalType: "success",
          })
        );
        setShowAddMemberModal(false);
        setNewMember({ first_name: "", MI: "", last_name: "", email: "", role: "Member" });
        return;
      }
      dispatch(
        showModal({
          title: "Member Not Found",
          message: `${newMember.email} is not in our system yet. Please contact them directly or reach out to NPNL (npnlusc@gmail.com) to send an invitation on your behalf.`,
          modalType: "error",
        })
      );
      
      setShowAddMemberModal(false);
      setNewMember({ first_name: "", MI: "", last_name: "", email: "", role: "Member" });

    } catch (error) {
      console.error("Error adding member:", error);
      dispatch(
        showModal({
          title: "Error",
          message: "Failed to add member. Please try again.",
          modalType: "error",
        })
      );
    }
  };
  const addInstitution = () => {
    setInstitutions([
      ...institutions,
      { department: "", university: "", address: "", city: "", state: "", country: "" },
    ]);
  };

  const removeInstitution = (index: number) => {
    setInstitutions(institutions.filter((_, i) => i !== index));
  };
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateOrcid = (orcid: string) => {
    if (!orcid) return true;
    const trimmed = orcid.trim().toUpperCase();
    if (trimmed === "NA" || trimmed === "N/A") {
      return true;
    }
    // ORCID must be exactly 16 digits (no hyphens)
    const cleaned = orcid.replace(/-/g, ""); // allow user to type with hyphens
    return /^\d{16}$/.test(cleaned);
  };
  const formatOrcid = (value: string) => {
    const trimmed = value.trim().toUpperCase();
  
    // If it's "NA" or "N/A", keep it as is
    if (trimmed === "NA" || trimmed === "N/A") {
      return trimmed;
    }
    // Remove non-digits
    const digits = value.replace(/\D/g, "").slice(0, 16);

    // Insert hyphens: XXXX-XXXX-XXXX-XXXX
    return digits
      .replace(/(\d{4})(?=\d)/g, "$1-")
      .replace(/(\d{4}-\d{4})(?=\d)/, "$1-")
      .replace(/(\d{4}-\d{4}-\d{4})(?=\d)/, "$1-");
  };
  const updateContributingMembersCohorts = async (token: string) => {
    try {
      const piCohorts = localDataFrame.cohort_enigma_list || [];
    
      if (piCohorts.length === 0) {
        console.log("PI has no cohorts to assign");
        return;
      }
      const allMemberEmails = new Set<string>();
      cohortContributors.forEach(cohortData => {
        cohortData.members.forEach(member => {
          allMemberEmails.add(member.email.toLowerCase());
        });
      });
      if (allMemberEmails.size === 0) {
        console.log("No contributing members to update");
        return;
      }
      let updatedCount = 0;
      let errorCount = 0;

      for (const memberEmail of Array.from(allMemberEmails)) {
        try {
          // Find member in all collaborators
          const allCollaborators = await ApiUtils.fetchCollaborators(token);
          const memberData = allCollaborators.find(
            (c: any) => c.email.toLowerCase() === memberEmail.toLowerCase()
          );

          if (!memberData) {
            console.error(`Member ${memberEmail} not found`);
            errorCount++;
            continue;
          }

          // Fetch full member details
          const fullMemberData = await ApiUtils.fetchCollaboratorByIndex(token, memberData.index);

          // Get member's current cohorts
          const memberCohorts = fullMemberData.cohort_enigma_list || [];
          
          // Append PI's cohorts to member's cohorts (avoiding duplicates)
          const combinedCohorts = [...memberCohorts, ...piCohorts];
          const updatedCohorts = Array.from(new Set(combinedCohorts));

          // Check if anything changed
          if (JSON.stringify(memberCohorts.sort()) === JSON.stringify(updatedCohorts.sort())) {
            continue; // No change needed
          }

          // Update the member's cohort list with special flag
          const updatePayload = {
            index: fullMemberData.index,
            cohort_enigma_list: updatedCohorts,
            _pi_cohort_update: true,
          };

          await ApiUtils.updateCollabUserDetails(token, updatePayload);
          updatedCount++;

        } catch (error) {
          console.error(`Error updating cohort for ${memberEmail}:`, error);
          errorCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`Updated cohorts for ${updatedCount} contributing member(s)`);
      }
      if (errorCount > 0) {
        console.error(`Failed to update ${errorCount} member(s)`);
      }

    } catch (error) {
      console.error("Error updating contributing members' cohorts:", error);
    }
  };
  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = await getCurrentUserToken();
    const emailList = (localDataFrame.emails || []).filter(
      (e: string) => e.trim() !== ""
    );
    let emailError = "";
    let orcidError = "";
    for (const email of emailList) {
      if (!validateEmail(email)) {
        emailError = "One or more email addresses are invalid.";
        break;
      }
    }
    if (localDataFrame.orcid && !validateOrcid(localDataFrame.orcid)) {
      orcidError = "ORCID must be 16 digits or 'NA'.";
    }
    // If there are errors → show them and stop submit
    if (emailError || orcidError) {
      setErrors({
        emails: emailError,
        orcid: orcidError,
      });
      return;
    }
    setErrors({
      emails: "",
      orcid: "",
    });
    const firstInstitution = institutions[0] || {
      department: "",
      university: "",
      address: "",
      city: "",
      state: "",
      country: ""
    };

    // Build final payload
    const payload = {
       ...(action === "update" && { index: localDataFrame.index }),
      profile_picture: profilePicture || "",
      // Keep multi-email system
      emails: emailList,
      first_name: localDataFrame.first_name || "",
      last_name: localDataFrame.last_name || "",
      MI: localDataFrame.MI || "",
      // Degrees, ORCID
      degrees: localDataFrame.degrees || [],
      orcid: localDataFrame.orcid || "",

      // Institution LIST fields expected by backend
      institutions: institutions.map(inst => ({
        department: inst.department || "",
        university: inst.university || "",
        address: inst.address || "",
        city: inst.city || "",
        state: inst.state || "",
        country: inst.country || ""
      })),
      pi_last_name: localDataFrame.pi_last_name || [],
      blanket_opt_in: localDataFrame.blanket_opt_in || "",
      // Cohorts
      cohort_enigma_list: localDataFrame.cohort_enigma_list || [],
      cohort_orig_list: localDataFrame.cohort_orig_list || [],
      role: localDataFrame.role || "Member",
      // Members
      active_members: activeMembers || [],
      former_members: formerMembers || [],
      //contributing_members: contributingMembers || [],
      cohort_contributors: cohortContributors,
      //cohort_funding_ack: cohortFundingAck || "",
      cohort_funding: cohortFunding,
      // Funding + Disclosures
      funding: funding.filter(f => f && f.trim()).length > 0 
      ? funding.filter(f => f && f.trim()) 
      : [],
      disclosures: disclosures.filter(d => d.category && d.details && d.details.trim()).map
      (d => JSON.stringify(d)),
      //credit_roles: localDataFrame.credit_roles,
    };
    //console.log("PAYLOAD BEING SENT:", payload);
    if (isAdmin) {
      payload.cohort_enigma_list = localDataFrame.cohort_enigma_list || [];
      payload.cohort_orig_list = localDataFrame.cohort_orig_list || [];
      payload.role = localDataFrame.role || "Member";
    }
    try {
      if (action === "update") {
        await ApiUtils.updateCollabUserDetails(token, payload);
        if ((localDataFrame.role === "PI" || localDataFrame.role === "Co-PI") && 
            cohortContributors.length > 0 && token) {
          await updateContributingMembersCohorts(token);
        }
      } else {
        payload.cohort_enigma_list = localDataFrame.cohort_enigma_list || [];
        payload.cohort_orig_list = localDataFrame.cohort_orig_list || [];
        payload.role = localDataFrame.role || "Member";
        await ApiUtils.addCollaborator(token, payload);
      }

      handleSubmit();
      console.log(
        `User details ${action === "update" ? "updated" : "added"} successfully`
      );
    } catch (error) {
      console.error(
        `Error ${action === "update" ? "updating" : "adding"} user details:`,
        error
      );
    }
  };
  const isPI = localDataFrame.role === "PI";

  const handleDelete = async () => {
    if ((userRole === "PI" || userRole === "Co-PI") && !isAdmin) {
      dispatch(
        showModal({
          title: "Delete Not Allowed",
          message: "If you need to delete members, please contact NPNL.",
          modalType: "error",
        })
      );
      return;
    }
    const token = await getCurrentUserToken();
    try {
      // Use index instead of id
      await ApiUtils.deleteCollaborator(token, localDataFrame.index);
      handleSubmit();
      console.log("User details deleted successfully");
    } catch (error) {
      console.error("Error deleting user details:", error);
      // Show error to user
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Card>
        <Card.Body>
          <Form onSubmit={handleUpdate}>
            {/* --- Profile Picture Section --- */}
            <Row className="mb-4">
              <Col className="d-flex flex-column align-items-center">
                <div className="position-relative">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Profile"
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #007bff",
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute"
                        style={{
                          top: "0",
                          right: "0",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          padding: "0",
                        }}
                        onClick={handleRemoveImage}
                        title="Remove picture"
                      >
                        ×
                      </Button>
                    </>
                  ) : (
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        backgroundColor: "#e9ecef",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #6c757d",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        fill="#6c757d"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <input
                    type="file"
                    id="profile-picture-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="profile-picture-upload">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as="span"
                      style={{ cursor: "pointer" }}
                    >
                      {previewUrl ? "Change Picture" : "Upload Picture"}
                    </Button>
                  </label>
                </div>
                
                <small className="text-muted mt-2">
                  Max size: 2MB. Formats: JPG, PNG, GIF
                </small>
              </Col>
            </Row>
            {/* --- First Row: Basic Info --- */}
            <Row className="align-items-end mb-4">
              <Col md={3}>
                <Form.Group controlId="first_name">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={localDataFrame["first_name"] || ""}
                    onChange={(e) =>
                      setDataFrame({
                        ...localDataFrame,
                        first_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group controlId="MI">
                  <Form.Label>MI</Form.Label>
                  <Form.Control
                    type="text"
                    name="MI"
                    maxLength={2}
                    value={localDataFrame["MI"] || ""}
                    onChange={(e) =>
                      setDataFrame({ ...localDataFrame, MI: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="last_name">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={localDataFrame["last_name"] || ""}
                    onChange={(e) =>
                      setDataFrame({
                        ...localDataFrame,
                        last_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="degree">
                  <Form.Label className="mb-1">Degree(s)</Form.Label>
                  <Select
                    isMulti
                    options={degreeOptions}
                    value={degreeOptionsSelected}
                    onChange={(selected) => {
                      setDegreeOptionsSelected(selected as any);
                      setDataFrame({
                        ...localDataFrame,
                        degrees: (selected as any).map((d: any) => d.value),
                      });
                    }}
                    placeholder="Select degrees..."
                    isSearchable
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="email_0">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email_0"
                    //placeholder="Enter email"
                    value={localDataFrame.emails?.[0] || ""}
                    onChange={(e) => {
                      const newEmails = [...(localDataFrame.emails || [])];
                      newEmails[0] = e.target.value;
                      setDataFrame({ ...localDataFrame, emails: newEmails });
                    }}
                  />
                  {errors.emails && (
                    <div className="text-danger mt-1">{errors.emails}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  const newEmails = [...(localDataFrame.emails || []), ""];
                  setDataFrame({ ...localDataFrame, emails: newEmails });
                }}
              >
                + Add another email
              </Button>
            </div>
            {localDataFrame.emails &&
              localDataFrame.emails.slice(1).map((email: string, index: number) => (
                <Row className="mb-3 align-items-end" key={index + 1}>
                  <Col md={12}>
                    <Form.Group controlId={`email_${index + 1}`}>
                      <Form.Label className="fw-bold text-muted">
                        Additional Email {index + 1}
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name={`email_${index + 1}`}
                        //placeholder="Enter another email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...(localDataFrame.emails || [])];
                          newEmails[index + 1] = e.target.value;
                          setDataFrame({ ...localDataFrame, emails: newEmails });
                        }}
                      />
                      <span
                        onClick={() => {
                          const updatedEmails = (localDataFrame.emails || []).filter(
                            (_: string, i: number) => i !== index + 1
                          );
                          setDataFrame({ ...localDataFrame, emails: updatedEmails });
                        }}
                        style={{
                          position: "absolute",
                          right: "25px",
                          top: "38px",
                          cursor: "pointer",
                          color: "#888",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        ×
                      </span>
                    </Form.Group>
                  </Col>
                </Row>
              ))
            }
            {/* --- Role Dropdown Row --- */}
            <Row className="mb-3">
              <Col md={localDataFrame.role === "Member" ? 4 : 12}>
                <Form.Group controlId="role">
                  <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={localDataFrame.role || ""}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setDataFrame({ ...localDataFrame, role: newRole });
                      if (newRole !== "Member") {
                        setPiLastName("");
                        setDataFrame({ ...localDataFrame, role: newRole, pi_last_name: "" });
                      }
                    }}
                    disabled={!canEditField("role")}
                  >
                    <option value="">Select role</option>
                    <option value="Member">Member</option>
                    <option value="PI">PI</option>
                    <option value="Co-PI">Co-PI</option>
                  </Form.Select>
                  {!canEditField("role") && (
                    <Form.Text className="text-muted">
                      Only admins can change roles
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              
              {/* Show PI Name field only if role is Member */}
              {localDataFrame.role === "Member" && (
                <Col md={8}>
                  <Form.Group controlId="pi_last_name">
                    <Form.Label>PI Name</Form.Label>
                    <Select
                      options={allPIs}
                      value={
                        Array.isArray(localDataFrame.pi_last_name)
                          ? localDataFrame.pi_last_name
                              .map(pi => allPIs.find(option => option.value === pi))
                              .filter(Boolean)
                          : (piLastName ? allPIs.find(pi => pi.value === piLastName) : null)
                      }
                      //value={allPIs.find(pi => pi.value === piLastName) || null}
                      //onChange={(selected: any) => {
                      // setPiLastName(selected ? selected.value : "");
                      //}}
                      onChange={(selected: any) => {
                        // Handle multi-select
                        if (Array.isArray(selected)) {
                          const selectedValues = selected.map(s => s.value);
                          setDataFrame({
                            ...localDataFrame,
                            pi_last_name: selectedValues
                          });
                        } else if (selected) {
                          // Single selection (backward compatibility)
                          setDataFrame({
                            ...localDataFrame,
                            pi_last_name: [selected.value]
                          });
                        } else {
                          // Cleared
                          setDataFrame({
                            ...localDataFrame,
                            pi_last_name: []
                          });
                        }
                      }}
                      isDisabled={
                        !canEditField("pi_last_name") || 
                        (!isAdmin && userRole === "Member" && isUpdateMode && !!initialDataFrame.pi_last_name) // ✅ Lock if already set in update mode
                      }
                      isMulti
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "38px",
                        }),
                      }}
                    />
                    {!isAdmin && userRole === "Member" && isUpdateMode && !!initialDataFrame.pi_last_name && (
                      <Form.Text className="text-muted">
                        PI last name cannot be changed. Contact your PI or an admin if this needs to be updated.
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              )}
            </Row>
            {/* --- ORCID Row --- */}
            <Row className="align-items-end mb-3">
              <Col md={12}>
                <Form.Group controlId="orcid">
                  <Form.Label className="mb-1">ORCID (16 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="orcid"
                    placeholder="Write NA if none"
                    value={localDataFrame["orcid"] || ""}
                    onChange={(e) => {
                      const value = e.target.value.trim().toUpperCase();
                      if (value === "NA" || value === "N/A" || value === "N") {
                          setDataFrame({ ...localDataFrame, orcid: value });
                      } else {
                          const formatted = formatOrcid(e.target.value);
                          setDataFrame({ ...localDataFrame, orcid: formatted })
                      } 
                    }}
                  />
                  {errors.orcid && (
                    <div className="text-danger mt-1">{errors.orcid}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {institutions.map((inst, index) => (
              <Card className="mb-3" key={index}>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId={`department-${index}`}>
                        <Form.Label className="mb-1">Department</Form.Label>
                        <Form.Control
                          type="text"
                          value={inst.department}
                          onChange={(e) => {
                            const updated = [...institutions];
                            updated[index].department = e.target.value;
                            setInstitutions(updated);
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId={`university-${index}`}>
                        <Form.Label className="mb-1">University/Institution</Form.Label>
                        <Form.Control
                          type="text"
                          value={inst.university}
                          onChange={(e) => {
                            const updated = [...institutions];
                            updated[index].university = e.target.value;
                            setInstitutions(updated);
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId={`address-${index}`}>
                        <Form.Label className="mb-1">Address</Form.Label>
                        <Form.Control
                          type="text"
                          value={inst.address}
                          onChange={(e) => {
                            const updated = [...institutions];
                            updated[index].address = e.target.value;
                            setInstitutions(updated);
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="align-items-end">
                    <Col md={4}>
                      <Form.Group controlId={`city-${index}`}>
                        <Form.Label className="mb-1">City</Form.Label>
                        <Form.Control
                          type="text"
                          value={inst.city}
                          onChange={(e) => {
                            const updated = [...institutions];
                            updated[index].city = e.target.value;
                            setInstitutions(updated);
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId={`state-${index}`}>
                        <Form.Label className="mb-1">State/Province</Form.Label>
                        <Form.Control
                          type="text"
                          value={inst.state}
                          onChange={(e) => {
                            const updated = [...institutions];
                            updated[index].state = e.target.value;
                            setInstitutions(updated);
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group controlId={`country-${index}`}>
                        <Form.Label className="mb-1">Country</Form.Label>
                        <AnySelect
                          options={countryOptions}
                          value={
                            inst.country
                              ? { label: inst.country, value: inst.country }
                              : null
                          }
                          onChange={(option: { label: string; value: string } | null) => {
                            const updated = [...institutions];
                            updated[index].country = option?.label || "";
                            setInstitutions(updated);
                          }}
                          //="Select country"
                          isSearchable
                        />
                      </Form.Group>
                    </Col>

                    <Col md={1} className="d-flex justify-content-end">
                      {institutions.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeInstitution(index)}
                        >
                          ×
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            <div className="d-flex justify-content-end mb-4">
              <Button variant="outline-primary" onClick={addInstitution}>
                + Add Another Institution
              </Button>
            </div>
            {(localDataFrame.role === "PI" || localDataFrame.role === "Co-PI") && action === 'update' && (
              <>
                <Row className="align-items-center mb-3">
                  <Col className="d-flex justify-content-end">
                    <Button variant="outline-primary" onClick={handleAddMemberClick}>
                      + Add Member
                    </Button>
                  </Col>
                </Row>
                <DragDropContext onDragEnd={handleDragEnd}>
                <Row className="mt-3 mb-3">
                  <Col md={6}>
                    <Card>
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>Active Members</span>
                        <small className="text-muted">Drag to move</small>
                      </Card.Header>
                      <Card.Body style={{ minHeight: '150px' }}>
                        <Droppable droppableId="active-members">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                //backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                                minHeight: '100px',
                                padding: '8px',
                                transition: 'background-color 0.2s ease',
                              }}
                            >
                              {activeMembers.length > 0 ? (
                                activeMembers.map((m, idx) => (
                                  <Draggable key={m.email} draggableId={m.email} index={idx}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          userSelect: 'none',
                                          padding: '12px',
                                          margin: '0 0 8px 0',
                                          //backgroundColor: snapshot.isDragging ? '#bbdefb' : '#f5f5f5',
                                          border: '1px solid #ddd',
                                          borderRadius: '4px',
                                          cursor: 'grab',
                                          display: 'inline-block',
                                          width: 'auto',
                                          maxWidth: '100%',
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div className="d-flex align-items-center">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-grip-vertical me-2"
                                            viewBox="0 0 16 16"
                                            style={{ color: '#999' }}
                                          >
                                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                          </svg>
                                          <div>
                                            <strong>{m.first_name} {m.last_name}</strong>
                                            {/* <div className="text-muted small">{m.email}</div> */}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <div className="text-muted text-center" style={{ padding: '20px' }}>
                                  No active members.
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card>
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>Former Members</span>
                        <small className="text-muted">Drag to move</small>
                      </Card.Header>
                      <Card.Body style={{ minHeight: '150px' }}>
                        <Droppable droppableId="former-members">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                //backgroundColor: snapshot.isDraggingOver ? '#fff3e0' : 'transparent',
                                minHeight: '100px',
                                padding: '8px',
                                transition: 'background-color 0.2s ease',
                              }}
                            >
                              {formerMembers.length > 0 ? (
                                formerMembers.map((m, idx) => (
                                  <Draggable key={m.email} draggableId={`former-${m.email}`} index={idx}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          userSelect: 'none',
                                          padding: '12px',
                                          margin: '0 0 8px 0',
                                          //backgroundColor: snapshot.isDragging ? '#ffe0b2' : '#f5f5f5',
                                          border: '1px solid #ddd',
                                          borderRadius: '4px',
                                          cursor: 'grab',
                                          display: 'inline-block',  
                                          width: 'auto',
                                          maxWidth: '100%',
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div className="d-flex align-items-center">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-grip-vertical me-2"
                                            viewBox="0 0 16 16"
                                            style={{ color: '#999' }}
                                          >
                                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                          </svg>
                                          <div>
                                            <strong>{m.first_name} {m.last_name}</strong>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <div className="text-muted text-center" style={{ padding: '20px' }}>
                                  No former members.
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </DragDropContext>
             </>
            )}
              {/* --- Cohort Info Row --- */}
              {(localDataFrame.role === "PI" || localDataFrame.role === "Co-PI") && (
              <Row className="mt-3 mb-3">
                <Col md={6}>
                  <Form.Group controlId="cohortEnigma">
                    <Form.Label className="mb-1">Cohort Name (ENIGMA)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter cohort names separated by comma or semicolon"
                      value={
                        Array.isArray(localDataFrame.cohort_enigma_list)
                          ? localDataFrame.cohort_enigma_list.join("; ")
                          : localDataFrame.cohort_enigma_list || ""
                      }
                      onChange={(e) => {
                        setDataFrame({
                          ...localDataFrame,
                          cohort_enigma_list: e.target.value,
                        });
                      }}
                      onBlur={(e) => {
                        //Only split into array when user leaves the field
                        const value = e.target.value.trim();
                        if (value) {
                          const list = value
                            .split(/[,;]/)
                            .map((x) => x.trim())
                            .filter((x) => x !== "");
                          setDataFrame({
                            ...localDataFrame,
                            cohort_enigma_list: list,
                          });
                        } else {
                          setDataFrame({
                            ...localDataFrame,
                            cohort_enigma_list: [],
                          });
                        }
                      }}
                      disabled={!canEditField("cohort_enigma_list")}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="cohortOrig">
                    <Form.Label className="mb-1">Cohort Name (Orig)</Form.Label>
                    <Form.Control
                      type="text"
                      //placeholder="Enter original cohort name"
                      value={(localDataFrame.cohort_orig_list || []).join("; ")}
                      onChange={(e) => {
                        const list = e.target.value
                          .split(";")
                          .map((x) => x.trim())
                          .filter((x) => x !== "");
                        setDataFrame({
                          ...localDataFrame,
                          cohort_orig_list: list,
                        })
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            {/* Contributing Members Section - Only for PI/Co-PI in update mode */}
            {(localDataFrame.role === "PI" || localDataFrame.role === "Co-PI") &&
              action === "update" && (
                <Row className="mb-4">
                  <Col md={12}>
                    <h5 className="mb-3">Contributing Members by Cohort</h5>
                    <p className="text-muted" style={{ fontSize: "14px", marginBottom: "16px" }}>
                      Select cohorts and assign contributing members with their CRediT roles for each cohort
                    </p>

                    {/* Select Cohorts */}
                    <Form.Group className="mb-4">
                      <Form.Label>Select Cohorts to Manage Contributors</Form.Label>
                      <Select
                        isMulti
                        options={(Array.isArray(localDataFrame.cohort_enigma_list) ? localDataFrame.cohort_enigma_list : []).map((cohort: string) => ({
                          value: cohort,
                          label: cohort,
                        }))}
                        value={selectedCohortForContributors.map(c => ({ value: c, label: c }))}
                        onChange={(selected) => {
                          const cohorts = (selected as any).map((s: any) => s.value);
                          setSelectedCohortForContributors(cohorts);
                          
                          // Initialize empty contributor arrays for newly selected cohorts
                          const updated = [...cohortContributors];
                          cohorts.forEach((cohort: string) => {
                            const exists = updated.some(c => c.cohort === cohort);
                            if (!exists) {
                              updated.push({ cohort, members: [] });
                            }
                          });
                          setCohortContributors(updated);
                          const updatedFunding = [...cohortFunding];
                          cohorts.forEach((cohort: string) => {
                            const exists = updatedFunding.some(c => c.cohort === cohort);
                            if (!exists) {
                              updatedFunding.push({ cohort, funding: "" });
                            }
                          });
                          setCohortFunding(updatedFunding);
                        }}
                        placeholder="Select cohorts to manage"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: "42px",
                          }),
                        }}
                      />
                      <Form.Text className="text-muted">
                        You can manage contributors separately for each cohort
                      </Form.Text>
                    </Form.Group>

                    {/* Display contributors for each selected cohort */}
                    {selectedCohortForContributors.map((cohort) => {
                      const cohortData = cohortContributors.find(c => c.cohort === cohort);
                      const cohortMembers = cohortData?.members || [];
                      
                      const cohortFundingData = cohortFunding.find(c => c.cohort === cohort);
                      const fundingText = cohortFundingData?.funding || "";
                      return (
                        <div
                          key={cohort}
                          style={{
                            border: "2px solid #0d6efd",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "24px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <h6 className="mb-3" style={{ color: "#0d6efd", fontWeight: 600 }}>
                            Cohort: {cohort}
                          </h6>
                          {/* ✅ ADD COHORT FUNDING FIELD */}
                          <Form.Group className="mb-4">
                            <Form.Label style={{ fontWeight: 500 }}>
                              Cohort Funding Acknowledgment
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder={`Enter funding acknowledgment for cohort ${cohort}`}
                              value={fundingText}
                              onChange={(e) => {
                                const updated = [...cohortFunding];
                                const existingIndex = updated.findIndex(c => c.cohort === cohort);
                                if (existingIndex >= 0) {
                                  updated[existingIndex].funding = e.target.value;
                                } else {
                                  updated.push({ cohort, funding: e.target.value });
                                }
                                setCohortFunding(updated);
                              }}
                              style={{fontSize: "14px",}}
                            />
                            <Form.Text className="text-muted">
                              Funding acknowledgment specific to this cohort
                            </Form.Text>
                          </Form.Group>
                          {/* Select Contributing Members for this cohort */}
                          <Form.Group className="mb-3">
                            <Form.Label>Select Contributing Members</Form.Label>
                            <Select
                              isMulti
                              options={[
                                // Add PI/Co-PI themselves
                                {
                                  value: localDataFrame.emails?.[0] || "",
                                  label: `${localDataFrame.first_name} ${localDataFrame.last_name} (You - ${localDataFrame.role})`,
                                  data: {
                                    first_name: localDataFrame.first_name,
                                    last_name: localDataFrame.last_name,
                                    email: localDataFrame.emails?.[0] || "",
                                    role: localDataFrame.role,
                                  },
                                },
                                // Add all active members
                                ...activeMembers.map((member: any) => ({
                                  value: member.email,
                                  label: `${member.first_name} ${member.last_name} (${member.email})`,
                                  data: member,
                                })),
                                // Add all former members
                                ...formerMembers.map((member: any) => ({
                                  value: member.email,
                                  label: `${member.first_name} ${member.last_name} (${member.email}) - Former`,
                                  data: member,
                                })),
                              ]}
                              value={cohortMembers.map((member: any) => ({
                                value: member.email,
                                label: `${member.first_name} ${member.last_name}`,
                                data: member,
                              }))}
                              onChange={(selected) => {
                                const updatedMembers = (selected as any).map((option: any) => {
                                  // Preserve existing credit_roles if member was already in the list
                                  const existingMember = cohortMembers.find(
                                    (m: any) => m.email === option.data.email
                                  );
                                  return {
                                    first_name: option.data.first_name,
                                    last_name: option.data.last_name,
                                    email: option.data.email,
                                    role: option.data.role,
                                    credit_roles: existingMember?.credit_roles || [],
                                  };
                                });
                                const updated = [...cohortContributors];
                                const existingIndex = updated.findIndex(c => c.cohort === cohort);
                                
                                if (existingIndex >= 0) {
                                  updated[existingIndex].members = updatedMembers;
                                } else {
                                  updated.push({ cohort, members: updatedMembers });
                                }
                                setCohortContributors(updated);
                              }}
                              placeholder="Select contributing members for this cohort"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "42px",
                                }),
                              }}
                            />
                          </Form.Group>

                          {/* Display selected contributing members with CRediT roles */}
                          {cohortMembers.length > 0 && (
                            <div style={{ marginTop: "20px" }}>
                              <h6 className="mb-3">Assign CRediT Roles</h6>
                              {cohortMembers.map((member: any, memberIndex: number) => (
                                <div
                                  key={memberIndex}
                                  style={{
                                    border: "1px solid #dee2e6",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    marginBottom: "12px",
                                    backgroundColor: "white",
                                  }}
                                >
                                  <div style={{ marginBottom: "12px" }}>
                                    <div style={{ fontWeight: 600, fontSize: "15px" }}>
                                      {member.first_name} {member.last_name}
                                      {member.email === (localDataFrame.emails?.[0] || "") && (
                                        <span
                                          style={{
                                            marginLeft: "8px",
                                            fontSize: "12px",
                                            color: "#0d6efd",
                                            fontWeight: 500,
                                          }}
                                        >
                                          (You)
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                                      {member.email}
                                    </div>
                                  </div>

                                  {/* CRediT Roles for this member in this cohort */}
                                  <Form.Group>
                                    <Form.Label style={{ fontSize: "13px", fontWeight: 500 }}>
                                      CRediT Roles
                                    </Form.Label>
                                    <Select
                                      isMulti
                                      options={CREDIT_ROLES}
                                      value={(member.credit_roles || []).map((role: string) => ({
                                        value: role,
                                        label: role,
                                      }))}
                                      onChange={(selected) => {
                                        const updated = [...cohortContributors];
                                        const cohortIndex = updated.findIndex(c => c.cohort === cohort);
                                        if (cohortIndex >= 0) {
                                          updated[cohortIndex].members[memberIndex] = {
                                            ...member,
                                            credit_roles: (selected as any).map((s: any) => s.value),
                                          };
                                          setCohortContributors(updated);
                                        }  
                                      }}
                                      placeholder="Select contributor roles"
                                      styles={{
                                        control: (base) => ({
                                          ...base,
                                          minHeight: "38px",
                                          fontSize: "13px",
                                        }),
                                      }}
                                    />
                                    <Form.Text className="text-muted">
                                      Select all roles for this contributor in cohort {cohort}
                                    </Form.Text>
                                  </Form.Group>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {selectedCohortForContributors.length === 0 && (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6c757d",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px dashed #dee2e6",
                        }}
                      >
                        Select one or more cohorts above to manage their contributing members
                      </div>
                    )}
                  </Col>
                </Row>
              )}
          {/* --- Funding Acknowledgments --- */}
          <Row className="mt-3">
            <Col>
              <h5 className="mb-2" style={{ fontWeight: 400 }}>Individual Funding Acknowledgment</h5>
              <Form.Text className="text-muted d-block mb-3">
                Please include funding ID (e.g. grant number) and funding agency/entity as applicable. 
                Example: "NIH R01 0000000"
              </Form.Text>
            </Col>
          </Row>
          {funding.map((item, idx) => (
            <Row className="mb-2" key={idx}>
              <Col md={12}>
                <Form.Group style={{ position: "relative" }}>
                  <Form.Control
                    type="text"
                    placeholder={`Write NA if none`}
                    value={item}
                    onChange={(e) => {
                      const updated = [...funding];
                      updated[idx] = e.target.value;
                      setFunding(updated);
                    }}
                  />
                  {funding.length > 1 && (
                    <span
                      onClick={() => {
                        setFunding(funding.filter((_, i) => i !== idx));
                      }}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#888",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        zIndex: 5,
                      }}
                    >
                      ×
                    </span>
                  )}
                </Form.Group>
              </Col>
            </Row>
          ))}
          <div className="d-flex justify-content-end mb-4">
            <Button
              variant="outline-primary"
              onClick={() => setFunding([...funding, ""])}
            >
              + Add Funding Acknowledgment
            </Button>
          </div>
          {/* --- Disclosures --- */}
          <Row className="mt-3">
            <Col>
              <h5 className="mb-2" style={{ fontWeight: 400 }}>Disclosures</h5>
              <Form.Text className="text-muted d-block mb-3">
                Declare any competing interests, funding sources, or other conflicts
              </Form.Text>
            </Col>
          </Row>

          {disclosures.map((disclosure, idx) => (
            <Row className="mb-2" key={idx}>
              <Col md={3}>
                <Form.Select
                  value={disclosure.category}
                  onChange={(e) => {
                    const updated = [...disclosures];
                    updated[idx].category = e.target.value;
                    setDisclosures(updated);
                  }}
                >
                  {DISCLOSURE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              
              <Col md={9}>
                <Form.Control
                  type="text"
                  placeholder="Provide details..."
                  value={disclosure.details}
                  onChange={(e) => {
                    const updated = [...disclosures];
                    updated[idx].details = e.target.value;
                    setDisclosures(updated);
                  }}
                />
              </Col>
              
              <Col md={1} className="d-flex align-items-center justify-content-center">
                {disclosures.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setDisclosures(disclosures.filter((_, i) => i !== idx));
                    }}
                    title="Remove disclosure"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <div className="d-flex justify-content-end mb-4">
            <Button
              variant="outline-primary"
              onClick={() => setDisclosures([...disclosures, { category: "", details: "" }])}
            >
              + Add Disclosure
            </Button>
          </div>
          {(localDataFrame.role === "PI" || localDataFrame.role === "Co-PI") && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="blanket_opt_in">
                  <Form.Label>
                    <h5 className="mb-2" style={{ fontWeight: 400 }}>Blanket Opt-in</h5>
                  </Form.Label>
                  <div>
                    <Form.Check
                      type="switch"
                      id="blanket-opt-in-switch"
                      checked={blanketOptIn}
                      onChange={(e) => setBlanketOptIn(e.target.checked)}
                      disabled={!canEditField("blanket_opt_in")}
                      label=""
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          )}

            {/* --- Action Buttons --- */}
            <div className="d-flex justify-content-between mt-5">
              {action === "update" && canDelete && (
                <Button
                 variant="danger" 
                 onClick={handleDelete}
                 disabled={!isAdmin}
                 title={!isAdmin ? "Only admins can delete. Contact NPNL for deletions." : "Delete this collaborator"}
                 >
                  Delete
                </Button>
              )}
              <Button variant="primary" type="submit">
                {action === "update" ? "Update" : "Save"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      {showAddMemberModal && (
        <ModalComponent
          show={showAddMemberModal}
          onHide={() => {
            setShowAddMemberModal(false);
            setNewMember({ first_name: "", MI: "", last_name: "", email: "", role: "Member" });
          }}
          title="Add Member"
        >
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="member_first_name">
                  <Form.Label className="mb-0" style={{ fontWeight: 400 }}>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newMember.first_name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, first_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group controlId="member_MI">
                  <Form.Label className="mb-0" style={{ fontWeight: 400 }}>MI</Form.Label>
                  <Form.Control
                    type="text"
                    value={newMember.MI}
                    onChange={(e) =>
                      setNewMember({ ...newMember, MI: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="member_last_name">
                  <Form.Label className="mb-0" style={{ fontWeight: 400 }}>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newMember.last_name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, last_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="email">
                  <Form.Label className="mb-0" style={{ fontWeight: 400 }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="member_role">
                  <Form.Label className="mb-0" style={{ fontWeight: 400 }}>Role</Form.Label>
                  <Form.Control
                    type="role"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setNewMember({ first_name: "", MI: "", last_name: "", email: "", role: "" });
                }}
              >
                Cancel
              </Button>

              <Button variant="primary" onClick={handleAddMemberSubmit}>
                Add Member
              </Button>
            </div>
          </Form>
        </ModalComponent>
      )}
    </Container>
  );
};

export { CollaboratorDetails };
