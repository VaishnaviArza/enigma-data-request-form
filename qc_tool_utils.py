import json

demo = {
    "type": "list",
    "value": [
        {
            "Age": "<<AGE>>",
            "Sex": "<<SEX>>",
            "Race: Specify (if needed)": "<<RACE>>",
            "Ethnicity": "<<ETHNICITY>>",
            "Education (in Years)": "<<EDUCATION>>",
            "Date of Stroke": "<<DATE_OF_STROKE>>",
        }
    ],
}

medical_history = {
    "type": "table",
    "title": "Medical History",
    "ordering": {0: "Condition", 1: "Yes/No"},
    "value": [
        {
            "Condition": "Coronary Artery Disease (stents, CABG, MI)",
            "Yes/No": "<<CAD>>",
        },
        {"Condition": "Atrial Fibrillation", "Yes/No": "<<AFIB>>"},
        {"Condition": "Diabetes", "Yes/No": "<<DIABETES>>"},
        {"Condition": "Hypertension", "Yes/No": "<<HTN>>"},
        {"Condition": "Clinical Obesity (BMI > 29.9)", "Yes/No": "<<OBESITY>>"},
        {"Condition": "Smoking", "Yes/No": "<<SMOKING>>"},
        {"Condition": "Alcohol Use", "Yes/No": "<<ALCOHOL>>"},
        {"Condition": "Hyperlipidemia", "Yes/No": "<<HYPERLIPIDEMIA>>"},
        {"Condition": "Renal/Cardiac Failure", "Yes/No": "<<RENALCARDIAC_FAILURE>>"},
        {
            "Condition": "Prior Stroke or TIA (transient ischemic attack)",
            "Yes/No": "<<PRIORSTROKE>>",
        },
        {"Condition": "Cognitive Decline", "Yes/No": "<<COGDECLINE>>"},
        {"Condition": "Osteoarthritis", "Yes/No": "<<OSTEOARTHRITIS>>"},
        {"Condition": "Other Neurological Disease", "Yes/No": "<<OTHER_NEURO>>"},
        {"Condition": "Other", "Yes/No": "<<OTHER>>"},
    ],
}
premorbid_status = {
    "title": "Premorbid Status",
    "type": "list",
    "value": [
        {
            "Premorbid walking status": "<<PREMORBID_WALKING>>",
            "Premorbid living arrangements": "<<PREMORBID_LIVING>>",
        }
    ],
}

imaging = {
    "title": "Imaging",
    "type": "list",
    "value": [
        {
            "Confirmed stroke on imaging": "<<IMAGING_CONFIRMEDSTROKE>>",
            "CT Obtained": "<<IMAGING_CT>>",
            "Clinical MRI Obtained": "<<IMAGING_MRI>>",
            "If Yes, Date": "1/11/2022",  # check this
        }
    ],
}

stroke_information = {
    "title": "Stroke Information",
    "type": "list",
    "value": [
        {
            "First Stroke?": "<<FIRST_STROKE>>",
            "Stroke Type": "<<STROKE_TYPE>>",
            "Stroke Sub-type": "<<STROKE_SUBTYPE>>",
            "Stroke Hemisphere": "<<STROKE_HEMISPHERE>>",
            "Paretic Side": "<<PARETIC>>",
            "Stroke Location": [
                "<<STROKELOCATION_CORTICAL>>",
                "<<STROKELOCATION_SUBCORTICAL>>",
                "<<STROKELOCATION_MIDBRAIN>>",
                "<<STROKELOCATION_BRAINSTEM>>",
                "<<STROKELOCATION_OTHER>>",
            ],
        }
    ],
}

other_information = {
    "title": "Other Information",
    "type": "list",
    "value": [
        {
            "Thrombolysis/reperfusion Therapy": "<<THROMBOLYSIS>>",
            "Coronavirus Status": "<<COVID19>>",
            "Coronavirus Comorbidities": "<<COVID19_COMORBID>>",
            "Date of NIHSS (if pulled from chart)": "<<NIHSS_DATE>>",
            "NIHSS score (if pulled from chart)": "<<NIHSS_SCORE>>",
            "Handedness Before Stroke": "<<HANDEDNESS_PRIOR_STROKE>>",
            "Handedness After Stroke": "<<HANDEDNESS_POST_STROKE>>",
        }
    ],
}

handedness = {
    "title": "",
    "type": "list",
    "value": [{"Handedness (choose one):": "<<EDINBURGH_HANDEDNESS>>"}],
}

edinburgh_table = {
    "title": "",
    "type": "table",
    "ordering": {
        0: "When you are: ",
        1: "Which hand do you prefer?",
        2: "Left",
        3: "Right",
    },
    "value": [
        {
            "When you are: ": "Writing",
            "Which hand do you prefer?": "<<EDINBURGH_WRITING>>",
            "Left": "<<EDINBURGH_WRITING_L>>",
            "Right": "<<EDINBURGH_WRITING_R>>",
        },
        {
            "When you are: ": "Drawing",
            "Which hand do you prefer?": "<<EDINBURGH_DRAWING>>",
            "Left": "<<EDINBURGH_DRAWING_L>>",
            "Right": "<<EDINBURGH_DRAWING_R>>",
        },
        {
            "When you are: ": "Throwing",
            "Which hand do you prefer?": "<<EDINBURGH_THROWING>>",
            "Left": "<<EDINBURGH_THROWING_L>>",
            "Right": "<<EDINBURGH_THROWING_R>>",
        },
        {
            "When you are: ": "Using Scissors",
            "Which hand do you prefer?": "<<EDINBURGH_SCISSORS>>",
            "Left": "<<EDINBURGH_SCISSORS_L>>",
            "Right": "<<EDINBURGH_SCISSORS_R>>",
        },
        {
            "When you are: ": "Brushing Teeth",
            "Which hand do you prefer?": "<<EDINBURGH_TEETH>>",
            "Left": "<<EDINBURGH_TEETH_L>>",
            "Right": "<<EDINBURGH_TEETH_R>>",
        },
        {
            "When you are: ": "Using a knife (without a fork)",
            "Which hand do you prefer?": "<<EDINBURGH_KNIFE>>",
            "Left": "<<EDINBURGH_KNIFE_L>>",
            "Right": "<<EDINBURGH_KNIFE_R>>",
        },
        {
            "When you are: ": "Using a spoon",
            "Which hand do you prefer?": "<<EDINBURGH_SPOON>>",
            "Left": "<<EDINBURGH_SPOON_L>>",
            "Right": "<<EDINBURGH_SPOON_R>>",
        },
        {
            "When you are: ": "Using a broom (dominant hand)",
            "Which hand do you prefer?": "<<EDINBURGH_BROOM>>",
            "Left": "<<EDINBURGH_BROOM_L>>",
            "Right": "<<EDINBURGH_BROOM_R>>",
        },
        {
            "When you are: ": "Striking a match",
            "Which hand do you prefer?": "<<EDINBURGH_MATCH>>",
            "Left": "<<EDINBURGH_MATCH_L>>",
            "Right": "<<EDINBURGH_MATCH_R>>",
        },
        {
            "When you are: ": "Opening a jar",
            "Which hand do you prefer?": "<<EDINBURGH_JAR>>",
            "Left": "<<EDINBURGH_JAR_L>>",
            "Right": "<<EDINBURGH_JAR_R>>",
        },
        {
            "When you are: ": "",
            "Which hand do you prefer?": "",
            "Left": "<<EDINBURGH_TOTAL_L>>",
            "Right": "<<EDINBURGH_TOTAL_R>>",
        },
    ],
}

edinburgh_handedness_score = {
    "title": "",
    "type": "list",
    "value": [{"Edinburgh Handedness Score (Range: -100 +100)": "<<EDINBURGH_TOTAL>>"}],
}

mrs = {
    "title": "Modified Rankin Scale (mRS):",
    "type": "list",
    "description": "0 - No symptoms.\n1 - No significant disability. Able to carry out all usual activities, despite some symptoms.\n2 - Slight disability. Able to look after own affairs without assistance, but unable to carry out all previous activities.\n3 - Moderate disability. Requires some help, but able to walk unassisted.\n4 - Moderately severe disability. Unable to attend to own bodily needs without assistance, and unable to walk unassisted.\n5 - Severe disability. Requires constant nursing care and attention, bedridden, incontinent.\n",
    "value": [{"mRS Score - premorbid ": "<<MRS_PRE>>", "mRS Score - now": "<<MRS>>"}],
}

safe = {
    "title": "UE Strength (SAFE Score)",
    "type": "table",
    "description": "0 - Complete paralysis\n1 - Flicker of contraction\n2 - Movement possible if gravity eliminated\n3 - Movement against gravity but not resistance\n4 - Movement possible against some resistance\n5 - Normal power (cannot be overcome)\n",
    "ordering": {0: "Side", 1: "Deltoid", 2: "FE"},
    "value": [
        {"Side": "Right", "Deltoid": "<<SAFE_DELTOID_R>>", "FE": "<<SAFE_FE_R>>"},
        {"Side": "Left", "Deltoid": "<<SAFE_DELTOID_L>>", "FE": "<<SAFE_FE_L>>"},
    ],
}

total_safe_score = {
    "title": "",
    "type": "list",
    "value": [{"Right SAFE Score": "<<SAFE_R>>", "Left SAFE Score": "<<SAFE_L>>"}],
}

fugl_total = {
    "title": "",
    "type": "list",
    "value": [
        {"Right Total": "<<FMUE_TOTAL_R_SUM>>", "Left Total": "<<FMUE_TOTAL_L_SUM>>"}
    ],
}

upper_extremity = {
    "title": "Upper Extremity",
    "type": "table",
    "description": "• Explain tasks verbally and demonstrate. Patient should perform tasks on the unimpaired side first and tasks should be scored against unimpaired side (if possible). Repeat each task up to three times and score for best performance.\n• Unless otherwise specified:\n    • MAY NOT assist patient in attaining final position.\n    • Each task must be performed as a distinct unit with at least 3 seconds separating all tasks.\nONLY IF DOING IMU study: Mark if failed to reach starting position but ask to attempt motion even if starting cannot be achieved",
    "ordering": {
        0: "Category",
        1: "Movement Task",
        2: "Score Left",
        3: "Score Right",
        4: "Scoring Criteria",
    },
    "value": [
        {
            "Category": "Reflexes",
            "Movement Task": "a. Biceps or Finger Flexors (flexor)",
            "Score Left": "<<FMUE_BICEPSREFLEX_L>>",
            "Score Right": "<<FMUE_BICEPSREFLEX_R>>",
            "Scoring Criteria": "0 - No reflex activity can be elicited\n2 - Reflex activity can be elicited",
        },
        {
            "Category": "Reflexes",
            "Movement Task": "b. Triceps (extensor)",
            "Score Left": "<<FMUE_TRICEPSREFLEX_L>>",
            "Score Right": "<<FMUE_TRICEPSREFLEX_R>>",
            "Scoring Criteria": "0 - No reflex activity can be elicited\n2 - Reflex activity can be elicited",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "a. Shoulder Elevation",
            "Score Left": "<<FMUE_SHOULDERELEVATION_L>>",
            "Score Right": "<<FMUE_SHOULDERELEVATION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "b. Shoulder Retraction",
            "Score Left": "<<FMUE_SHOULDERRETRACTION_L>>",
            "Score Right": "<<FMUE_SHOULDERRETRACTION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "c. Shoulder Abduction",
            "Score Left": "<<FMUE_SHOULDERABDUCTION_L>>",
            "Score Right": "<<FMUE_SHOULDERABDUCTION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "d. External Rotation",
            "Score Left": "<<FMUE_EXTERNALROTATION_L>>",
            "Score Right": "<<FMUE_EXTERNALROTATION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "e. Elbow Flexion",
            "Score Left": "<<FMUE_ELBOWFLEXION_L>>",
            "Score Right": "<<FMUE_ELBOWFLEXION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Flexor Synergy",
            "Movement Task": "f. Forearm Supination",
            "Score Left": "<<FMUE_FOREARMSUPINATION_L>>",
            "Score Right": "<<FMUE_FOREARMSUPINATION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Extensor Synergy",
            "Movement Task": "a. Shoulder adduction/internal rotation",
            "Score Left": "<<FMUE_SHOULDERADDUCTION_L>>",
            "Score Right": "<<FMUE_SHOULDERADDUCTION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Extensor Synergy",
            "Movement Task": "b. Elbow Extension",
            "Score Left": "<<FMUE_ELBOWEXTENSION_L>>",
            "Score Right": "<<FMUE_ELBOWEXTENSION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Extensor Synergy",
            "Movement Task": "c. Forearm Pronation",
            "Score Left": "<<FMUE_FOREARMPRONATION_L>>",
            "Score Right": "<<FMUE_FOREARMPRONATION_R>>",
            "Scoring Criteria": "0 - Cannot be performed\n1 - Performed partly\n2 - Performed faultlessly",
        },
        {
            "Category": "Movement Combining Synergies",
            "Movement Task": "a. Hand to Lumbar Spine",
            "Score Left": "<<FMUE_HANDTOSPINE_L>>",
            "Score Right": "<<FMUE_HANDTOSPINE_R>>",
            "Scoring Criteria": "0 - Cannot be performed OR patient cannot get past ASIS without compensation\n1 - > 1 finger passed ASIS without compensation\n2 - > 1 finger reaches lumbar spine",
        },
        {
            "Category": "Movement Combining Synergies",
            "Movement Task": "b. Shoulder Flexion to 90º",
            "Score Left": "<<FMUE_SHOULDERFLEXION90_L>>",
            "Score Right": "<<FMUE_SHOULDERFLEXION90_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting position, OR *\n1 - Partly performed, OR **\n2 - Performed faultlessly AND maintained starting position",
        },
        {
            "Category": "Movement Combining Synergies",
            "Movement Task": "c. Pro/supination of Forearm (Elbow at 90º)",
            "Score Left": "<<FMUE_PROSUPFOREARM90_L>>",
            "Score Right": "<<FMUE_PROSUPFOREARM90_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting position, OR *\n1 - Partly performed, OR **\n2 - Performed faultlessly AND maintained starting position",
        },
        {
            "Category": "Movement Out of Synergy",
            "Movement Task": "a. Shoulder Abduction to 90º",
            "Score Left": "<<FMUE_SHOULDERABDUCTION90_L>>",
            "Score Right": "<<FMUE_SHOULDERABDUCTION90_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting * position, OR (initial elbow flexion or deviation from forearm pronation)\n1 - Abduction does not reach 90º, OR **\n2 - Performed faultlessly",
        },
        {
            "Category": "Movement Out of Synergy",
            "Movement Task": "b. Shoulder Flexion from 90 to 180",
            "Score Left": "<<FMUE_SHOULDERFLEXION180_L>>",
            "Score Right": "<<FMUE_SHOULDERFLEXION180_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting * position, OR (initial elbow flexion or shoulder abduction)\n1 - Shoulder flexion does not reach 180º, OR**\n2 - Performed faultlessly AND maintained starting position",
        },
        {
            "Category": "Movement Out of Synergy",
            "Movement Task": "c. Pro/supination of Forearm (Elbow at 0º)",
            "Score Left": "<<FMUE_PROSUPFOREARM0_L>>",
            "Score Right": "<<FMUE_PROSUPFOREARM0_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting position, OR *\n1 - Partly performed, OR**\n2 - Performed faultlessly AND maintained starting position",
        },
        {
            "Category": "Normal Reflex Activity",
            "Movement Task": "Biceps, Finger Flexors, Triceps",
            "Score Left": "<<FMUE_REFLEXACTIVITY_L>>",
            "Score Right": "<<FMUE_REFLEXACTIVITY_R>>",
            "Scoring Criteria": "0 - At least 2 of the 3 phasic reflexes are hyperactive OR not assessed\n1 - 1 reflex is hyper- active, OR at least 2 reflexes are lively\n2 - No more than one reflex is lively AND none are hyperctive",
        },
        {
            "Category": "TOTAL SCORE",
            "Movement Task": "Upper Extremity without reflexes",
            "Score Left": "<<FMUE_ARM_L>>",
            "Score Right": "<<FMUE_ARM_R>>",
            "Scoring Criteria": "Maximum Upper Extremity without reflexes Score = 30",
        },
        {
            "Category": "TOTAL SCORE",
            "Movement Task": "Arm",
            "Score Left": "<<FMUE_ARM_L_SUM>>",
            "Score Right": "<<FMUE_ARM_R_SUM>>",
            "Scoring Criteria": "Maximum Arm Score = 36",
        },
        {
            "Category": "Wrist",
            "Movement Task": "a. Wrist Stability (Elbow at 90º)",
            "Score Left": "<<FMUE_WRISTSTABILITY90_L>>",
            "Score Right": "<<FMUE_WRISTSTABILITY90_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting* position, OR (deviates at onset of extension)\n1 - Cannot maintain 15º** extension, (can extend to 15º, but deviates from starting position when trying to take resistance)\n2 - Start position maintained with slight resistance",
        },
        {
            "Category": "Wrist",
            "Movement Task": "b. Wrist Range of Motion (Elbow at 90º)",
            "Score Left": "<<FMUE_WRISTROMAT90_L>>",
            "Score Right": "<<FMUE_WRISTROMAT90_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting position, no movement, OR*\n1 - Any movement less than subject’s passive range, OR**\n2 - Start position maintained AND wrist flexion & extension is equal to subj",
        },
        {
            "Category": "Wrist",
            "Movement Task": "c. Wrist Stability (Elbow at 0º)",
            "Score Left": "<<FMUE_WRISTSTABILITY0_L>>",
            "Score Right": "<<FMUE_WRISTSTABILITY0_R>>",
            "Scoring Criteria": "0 - Extension not 15º, cannot maintain starting position, OR* (deviates at onset of extension)\n1 - Cannot maintain extension at 15º with resistance, OR ** (can extend to 15º, but deviates from starting position when trying to take resistance)\n2 - Start position maintained with slight resistance",
        },
        {
            "Category": "Wrist",
            "Movement Task": "d. Wrist Range of Motion (Elbow at 0º)",
            "Score Left": "<<FMUE_WRISTROMAT0_L>>",
            "Score Right": "<<FMUE_WRISTROMAT0_R>>",
            "Scoring Criteria": "0 - Cannot be performed, cannot maintain starting position, no movement, OR*\n1 - Any movement less than subject’s passive range, OR **\n2 - Start position maintained AND wrist flexion & extension is equal to subject’s passive range",
        },
        {
            "Category": "Wrist",
            "Movement Task": "e. Wrist Circumduction (Elbow at 0º)",
            "Score Left": "<<FMUE_WRISTCIRCUMDUCTION_L>>",
            "Score Right": "<<FMUE_WRISTCIRCUMDUCTION_R>>",
            "Scoring Criteria": "0 - No movement at proximal joints, cannot maintain starting position, OR*\n1 - Any movement less unaffected side’s (jerky or incomplete), OR**\n2 - Start position maintained AND wrist circumduction at least equal to subject’s unaffected side’s.",
        },
        {
            "Category": "TOTAL SCORE",
            "Movement Task": "WRIST",
            "Score Left": "<<FMUE_WRIST_L>>",
            "Score Right": "<<FMUE_WRIST_R>>",
            "Scoring Criteria": "Maximum Total Wrist Score = 10",
        },
        {
            "Category": "Hand",
            "Movement Task": "a. Finger Mass Flexion",
            "Score Left": "<<FMUE_FINGERMASSFLEX_L>>",
            "Score Right": "<<FMUE_FINGERMASSFLEX_R>>",
            "Scoring Criteria": "0 - No finger flexion\n1 - Any degree of finger flexion < 90º\n2 - Finger flexion >= unaffected side",
        },
        {
            "Category": "Hand",
            "Movement Task": "b. Finger Mass Extension",
            "Score Left": "<<FMUE_FINGERMASSEXTEND_L>>",
            "Score Right": "<<FMUE_FINGERMASSEXTEND_R>>",
            "Scoring Criteria": "0 - No finger extension\n1 - Any degree of finger extension that doesn’t reach 0º\n2 - Finger flexion >= unaffected side",
        },
        {
            "Category": "Hand",
            "Movement Task": "c. Hook Grasp",
            "Score Left": "<<FMUE_HOOKGRASP_L>>",
            "Score Right": "<<FMUE_HOOKGRASP_R>>",
            "Scoring Criteria": "0 - Cannot maintain starting position\n1 - Achieves starting position but grasp does not withstand resistance\n2 - Achieves start position AND grasp withstands resistance",
        },
        {
            "Category": "Hand",
            "Movement Task": "d. Thumb Adduction",
            "Score Left": "<<FMUE_THUMBADDUCT_L>>",
            "Score Right": "<<FMUE_THUMBADDUCT_R>>",
            "Scoring Criteria": "0 - Cannot maintain starting position\n1 - Achieves starting position but object not held against a tug\n2 - Achieves start position AND object held firmly against a tug",
        },
        {
            "Category": "Hand",
            "Movement Task": "e. Pincer Grasp",
            "Score Left": "<<FMUE_PINCERGRASP_L>>",
            "Score Right": "<<FMUE_PINCERGRASP_R>>",
            "Scoring Criteria": "0 - Cannot grasp object OR cannot maintain starting position\n1 - Achieves starting position, object is kept in place BUT not against tug\n2 - Achieves starting position, object is kept in place AND held firmly against tug",
        },
        {
            "Category": "Hand",
            "Movement Task": "f. Cylindrical Grasp",
            "Score Left": "<<FMUE_CYLINDRICALGRASP_L>>",
            "Score Right": "<<FMUE_CYLINDRICALGRASP_R>>",
            "Scoring Criteria": "0 - Cannot grasp object OR cannot maintain starting position\n1 - Achieves starting position, object is kept in place BUT not against tug\n2 - Achieves starting position, object is kept in place AND held firmly against tug",
        },
        {
            "Category": "Hand",
            "Movement Task": "g. Spherical Grasp",
            "Score Left": "<<FMUE_SPHERICALGRASP_L>>",
            "Score Right": "<<FMUE_SPHERICALGRASP_R>>",
            "Scoring Criteria": "0 - Cannot grasp object OR cannot maintain starting position\n1 - Achieves starting position, object is kept in place BUT not against tug\n2 - Achieves starting position, object is kept in place AND held firmly against tug",
        },
        {
            "Category": "TOTAL SCORE",
            "Movement Task": "HAND",
            "Score Left": "<<FMUE_HAND_L>>",
            "Score Right": "<<FMUE_HAND_R>>",
            "Scoring Criteria": "Maximum Total Hand Score = 14",
        },
        {
            "Category": "Normal Reflex Activity",
            "Movement Task": "Finger to nose with eyes closed",
            "Score Left": "<<FMUE_NOREFLEX_L>>",
            "Score Right": "<<FMUE_NOREFLEX_R>>",
            "Scoring Criteria": "IMPORTANT NOTE: If patient cannot assume starting position, score will be 0 for all subtests.",
        },
        {
            "Category": "Normal Reflex Activity",
            "Movement Task": "a. Tremor",
            "Score Left": "<<FMUE_TREMOR_L>>",
            "Score Right": "<<FMUE_TREMOR_R>>",
            "Scoring Criteria": "0 - Tremor throughout movement OR significantly affects trajectory\n1 - Tremor at the start and/or end of movement OR tremor that does not significantly affect trajectory\n2 - No tremor",
        },
        {
            "Category": "Normal Reflex Activity",
            "Movement Task": "b. Dysmetria",
            "Score Left": "<<FMUE_DYSMETRIA_L>>",
            "Score Right": "<<FMUE_DYSMETRIA_R>>",
            "Scoring Criteria": "0 - Pronounced dysmetria OR miss target > 2 times\n1 - Slight dysmetria OR miss target <= 2 times\n2 - No dysmetria",
        },
        {
            "Category": "Normal Reflex Activity",
            "Movement Task": "c. Speed",
            "Score Left": "<<FMUE_SPEED_SCORE_L>>",
            "Score Right": "<<FMUE_SPEED_SCORE_R>>",
            "Scoring Criteria": "0 - > 6 sec slower than unaffected hand\n1 - 2-5 sec slower than unaffected hand\n2 - < 2 sec difference",
        },
        {
            "Category": "TOTAL SCORE",
            "Movement Task": "HAND AND WRIST + Coordination/Speed",
            "Score Left": "<<FMUE_TOTALHANDWRISTCOORD_L>>",
            "Score Right": "<<FMUE_TOTALHANDWRISTCOORD_R>>",
            "Scoring Criteria": "Maximum Hand and Wrist + Coordination/Speed Score = 30",
        },
    ],
}

grasp_subscale = {
    "title": "Grasp Subscale",
    "type": "table",
    "ordering": {0: "Test Number", 1: "Item", 2: "Left Score", 3: "Right Score"},
    "value": [
        {
            "Test Number": "1",
            "Item": "Block, 10 cm3",
            "Left Score": "<<ARAT_CMBLOCK10_L>>",
            "Right Score": "<<ARAT_CMBLOCK10_R>>",
        },
        {
            "Test Number": "2",
            "Item": "Block, 2.5 cm3",
            "Left Score": "<<ARAT_CMBLOCK25_L>>",
            "Right Score": "<<ARAT_CMBLOCK25_R>>",
        },
        {
            "Test Number": "3",
            "Item": "Block, 5 cm3",
            "Left Score": "<<ARAT_CMBLOCK5_L>>",
            "Right Score": "<<ARAT_CMBLOCK5_R>>",
        },
        {
            "Test Number": "4",
            "Item": "Block, 7.5 cm3",
            "Left Score": "<<ARAT_CMBLOCK75_L>>",
            "Right Score": "<<ARAT_CMBLOCK75_R>>",
        },
        {
            "Test Number": "5",
            "Item": "Cricket ball",
            "Left Score": "<<ARAT_CRICKETBALL_L>>",
            "Right Score": "<<ARAT_CRICKETBALL_R>>",
        },
        {
            "Test Number": "6",
            "Item": "Sharpening stone",
            "Left Score": "<<ARAT_SHARPENINGSTONE_L>>",
            "Right Score": "<<ARAT_SHARPENINGSTONE_R>>",
        },
        {
            "Test Number": "",
            "Item": "Subtotal (/18)",
            "Left Score": "<<ARAT_GRASP_L_SUM>>",
            "Right Score": "<<ARAT_GRASP_R_SUM>>",
        },
    ],
}

grip_subscale = {
    "title": "Grip Subscale",
    "type": "table",
    "ordering": {0: "Test Number", 1: "Item", 2: "Left Score", 3: "Right Score"},
    "value": [
        {
            "Test Number": "7",
            "Item": "Pour water from one glass to another",
            "Left Score": "<<ARAT_POURWATER_L>>",
            "Right Score": "<<ARAT_POURWATER_R>>",
        },
        {
            "Test Number": "8",
            "Item": "Displace 2.25 cm alloy tube from one side of table to another",
            "Left Score": "<<ARAT_CMTUBE225_L>>",
            "Right Score": "<<ARAT_CMTUBE225_R>>",
        },
        {
            "Test Number": "9",
            "Item": "Displace 1 cm alloy tube from one side of table to another",
            "Left Score": "<<ARAT_CMTUBE1_L>>",
            "Right Score": "<<ARAT_CMTUBE1_R>>",
        },
        {
            "Test Number": "10",
            "Item": "Put washer over bolt",
            "Left Score": "<<ARAT_WASHER_L>>",
            "Right Score": "<<ARAT_WASHER_R>>",
        },
        {
            "Test Number": "",
            "Item": "Subtotal (/12)",
            "Left Score": "<<ARAT_GRIP_L_SUM>>",
            "Right Score": "<<ARAT_GRIP_R_SUM>>",
        },
    ],
}

pinch_subscale = {
    "title": "Pinch Subscale",
    "type": "table",
    "ordering": {0: "Test Number", 1: "Item", 2: "Left Score", 3: "Right Score"},
    "value": [
        {
            "Test Number": "11",
            "Item": "Ball bearing, held between ring finger and thumb",
            "Left Score": "<<ARAT_BALLBEARING_RINGTHUMB_L>>",
            "Right Score": "<<ARAT_BALLBEARING_RINGTHUMB_R>>",
        },
        {
            "Test Number": "12",
            "Item": "Marble, held between index finger and thumb",
            "Left Score": "<<ARAT_MARBLE_INDEXTHUMB_L>>",
            "Right Score": "<<ARAT_MARBLE_INDEXTHUMB_R>>",
        },
        {
            "Test Number": "13",
            "Item": "Ball bearing, held between middle finger and thumb",
            "Left Score": "<<ARAT_BALLBEARING_MIDDLETHUMB_L>>",
            "Right Score": "<<ARAT_BALLBEARING_MIDDLETHUMB_R>>",
        },
        {
            "Test Number": "14",
            "Item": "Ball bearing, held between index finger and thumb",
            "Left Score": "<<ARAT_BALLBEARING_INDEXTHUMB_L>>",
            "Right Score": "<<ARAT_BALLBEARING_INDEXTHUMB_R>>",
        },
        {
            "Test Number": "15",
            "Item": "Marble, held between ring finger and thumb",
            "Left Score": "<<ARAT_MARBLE_RINGTHUMB_L>>",
            "Right Score": "<<ARAT_MARBLE_RINGTHUMB_R>>",
        },
        {
            "Test Number": "16",
            "Item": "Marble, held between middle finger and thumb",
            "Left Score": "<<ARAT_MARBLE_MIDDLETHUMB_L>>",
            "Right Score": "<<ARAT_MARBLE_MIDDLETHUMB_R>>",
        },
        {
            "Test Number": "",
            "Item": "Subtotal (/18)",
            "Left Score": "<<ARAT_PINCH_L_SUM>>",
            "Right Score": "<<ARAT_PINCH_R_SUM>>",
        },
    ],
}

gross_movement_subscale = {
    "title": "Gross Movement Subscale",
    "type": "table",
    "ordering": {0: "Test Number", 1: "Item", 2: "Left Score", 3: "Right Score"},
    "value": [
        {
            "Test Number": "17",
            "Item": "Hand to behind the head",
            "Left Score": "<<ARAT_HANDBEHINDHEAD_L>>",
            "Right Score": "<<ARAT_HANDBEHINDHEAD_R>>",
        },
        {
            "Test Number": "18",
            "Item": "Hand to top of head",
            "Left Score": "<<ARAT_HANDTOPHEAD_L>>",
            "Right Score": "<<ARAT_HANDTOPHEAD_R>>",
        },
        {
            "Test Number": "19",
            "Item": "Hand to mouth",
            "Left Score": "<<ARAT_HANDTOMOUTH_L>>",
            "Right Score": "<<ARAT_HANDTOMOUTH_R>>",
        },
        {
            "Test Number": "",
            "Item": "Subtotal (/9)",
            "Left Score": "<<ARAT_GROSS_L_SUM>>",
            "Right Score": "<<ARAT_GROSS_R_SUM>>",
        },
        {
            "Test Number": "",
            "Item": "Total (/57)",
            "Left Score": "<<ARAT_TOTAL_L_SUM>>",
            "Right Score": "<<ARAT_TOTAL_R_SUM>>",
        },
    ],
}

sis = {
    "title": "",
    "type": "table",
    "description": "5 = Not difficult at all\n4 = A little difficult\n3 = Somewhat difficult\n2 = Very difficult\n1 = Could not do at all",
    "ordering": {0: "In the past 2 weeks, how difficult was it to", 1: "Score"},
    "value": [
        {
            "In the past 2 weeks, how difficult was it to": "a. Dress the top part of your body?",
            "Score": "<<SIS16_DRESS>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "b. Bathe yourself?",
            "Score": "<<SIS16_BATHE>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "c. Get to the toilet on time?",
            "Score": "<<SIS16_TOILET>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "d. Control your bladder (not have an accident)?",
            "Score": "<<SIS16_CONTROLBLADDER>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "e. Control your bowels (not have an accident)?",
            "Score": "<<SIS16_CONTROLBOWEL>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "f. Stand without losing balance?",
            "Score": "<<SIS16_STANDBALANCE>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "g. Go shopping?",
            "Score": "<<SIS16_SHOPPING>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "h. Do heavy household chores (e.g. vacuum, laundry or yard work)?",
            "Score": "<<SIS16_CHORES>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "i. Stay sitting without losing your balance?",
            "Score": "<<SIS16_SITTINGBALANCE>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "j. Walk without losing your balance?",
            "Score": "<<SIS16_WALKBALANCE>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "k. Move from a bed to a chair?",
            "Score": "<<SIS16_BEDTOCHAIR>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "l. Walk fast?",
            "Score": "<<SIS16_WALKFAST>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "m. Climb one flight of stairs?",
            "Score": "<<SIS16_STAIRS>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "n. Walk one block?",
            "Score": "<<SIS16_WALKONEBLOCK>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "o. Get in and out of a car?",
            "Score": "<<SIS16_CAR>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "p. Carry heavy objects (e.g. bag of groceries) with your affected hand?",
            "Score": "<<SIS16_HEAVYOBJECTSAFFECTEDHAND>>",
        },
        {
            "In the past 2 weeks, how difficult was it to": "Total",
            "Score": "<<SIS16_TOTAL_SUM>>",
        },
    ],
}

moca = {}

nih = {
    "title": "",
    "type": "table",
    "ordering": {0: "Instructions", 1: "Scale Definition", 2: "Score"},
    "value": [
        {
            "Instructions": "1a. Level of consciousness",
            "Scale Definition": "0 = Alert; keenly responsive\n1 = Not alert, arousable by minor stimulation\n2 = Not alert, requires repeated stimulation\n3 = Responds only with reflex motor movements",
            "Score": "<<NIHSS_1a>>",
        },
        {
            "Instructions": "1b. LOC Questions: Month and age",
            "Scale Definition": "0 = Answers both questions correctly\n1 = Answers one question correctly\n2 = Answers neither question correctly",
            "Score": "<<NIHSS_1b>>",
        },
        {
            "Instructions": "1c. LOC Commands: Open/close eyes and grip/release hands",
            "Scale Definition": "0 = Performs both tasks correctly\n1 = Performs one task correctly\n2 = Performs neither task correctly",
            "Score": "<<NIHSS_1c>>",
        },
        {
            "Instructions": "2. Best Gaze",
            "Scale Definition": "0 = Normal\n1 = Partial gaze palsy\n2 = Forced deviation",
            "Score": "<<NIHSS_2>>",
        },
        {
            "Instructions": "3. Visual",
            "Scale Definition": "0 = No visual loss\n1 = Partial hemianopia\n2 = Complete hemianopia\n3 = Bilateral hemianopia",
            "Score": "<<NIHSS_3>>",
        },
        {
            "Instructions": "4. Facial Palsy",
            "Scale Definition": "0 = Normal\n1 = Minor paralysis\n2 = Partial paralysis\n3 = Complete paralysis",
            "Score": "<<NIHSS_4>>",
        },
        {
            "Instructions": "5a. Motor Arm (Left)",
            "Scale Definition": "0 = No drift\n1 = Drift\n2 = Some effort against gravity\n3 = No effort against gravity\n4 = No movement\n9 = Amputation or joint fusion",
            "Score": "<<NIHSS_5a>>",
        },
        {
            "Instructions": "5b. Motor Arm (Right)",
            "Scale Definition": "0 = No drift\n1 = Drift\n2 = Some effort against gravity\n3 = No effort against gravity\n4 = No movement\n9 = Amputation or joint fusion",
            "Score": "<<NIHSS_5b>>",
        },
        {
            "Instructions": "6a. Motor Leg (Left)",
            "Scale Definition": "0 = No drift\n1 = Drift\n2 = Some effort against gravity\n3 = No effort against gravity\n4 = No movement\n9 = Amputation or joint fusion",
            "Score": "<<NIHSS_6a>>",
        },
        {
            "Instructions": "6b. Motor Leg (Right)",
            "Scale Definition": "0 = No drift\n1 = Drift\n2 = Some effort against gravity\n3 = No effort against gravity\n4 = No movement\n9 = Amputation or joint fusion",
            "Score": "<<NIHSS_6b>>",
        },
        {
            "Instructions": "7. Limb Ataxia",
            "Scale Definition": "0 = Absent\n1 = Present in one limb\n2 = Present in two limbs",
            "Score": "<<NIHSS_7>>",
        },
        {
            "Instructions": "8. Sensory",
            "Scale Definition": "0 = Normal\n1 = Mild to moderate sensory loss\n2 = Severe to total sensory loss",
            "Score": "<<NIHSS_8>>",
        },
        {
            "Instructions": "9. Best Language",
            "Scale Definition": "0 = No aphasia\n1 = Mild to moderate aphasia\n2 = Severe aphasia\n3 = Mute, global aphasia",
            "Score": "<<NIHSS_9>>",
        },
        {
            "Instructions": "10. Dysarthria",
            "Scale Definition": "0 = Normal\n1 = Mild to moderate dysarthria\n2 = Severe dysarthria\n9 = Intubated or other physical barrier",
            "Score": "<<NIHSS_10>>",
        },
        {
            "Instructions": "11. Extinction and Inattention",
            "Scale Definition": "0 = No abnormality\n1 = Visual, tactile, auditory, or spatial inattention\n2 = Profound hemi-inattention or neglect",
            "Score": "<<NIHSS_11>>",
        },
        {
            "Instructions": "",
            "Scale Definition": "Total",
            "Score": "<<NIHSS_TOTAL_SUM>>",
        },
    ],
}

nih_summary = {
    "title": "",
    "type": "list",
    "value": [
        {
            "Time of NIHSS Assessment": "<<NIHSS_TIME>>",
            "Date of NIHSS Assessment": "<<NIHSS_DATE>>",
            "Name of Person Conducting NIHSS Assessment": "<<NIHSS_CLINICIAN_NAME>>",
        }
    ],
}

eq5d_mobility = {
    "title": "Mobility",
    "type": "list",
    "value": [
        {
            "1. I have no problems in walking\n2. I have slight problems in walking\n3. I have moderate problems in walking\n4. I have severe problems in walking\n5. I am unable to walk": "<<EQ5D_MOBILITY>>"
        }
    ],
}

eq5d_self_care = {
    "title": "Self Care",
    "type": "list",
    "value": [
        {
            "1. I have no problems washing or dressing myself\n2. I have slight problems washing or dressing myself\n3. I have moderate problems washing or dressing myself\n4. I have severe problems washing or dressing myself\n5. I am unable to wash or dress myself": "<<EQ5D_SELFCARE>>"
        }
    ],
}

eq5d_usual_activities = {
    "title": "Usual Activities",
    "type": "list",
    # 'description': '(e.g. work, study, housework, family or leisure activites)',
    "value": [
        {
            "1. I have no problems doing my usual activities\n2. I have slight problems doing my usual activities\n3. I have moderate problems doing my usual activities\n4. I have severe problems doing my usual activities\n5. I am unable to do my usual activities": "<<EQ5D_USUALACTIVITIES>>"
        }
    ],
}

eq5d_pain_discomfort = {
    "title": "Pain/Discomfort",
    "type": "list",
    "value": [
        {
            "1. I have no pain or discomfort\n2. I have slight pain or discomfort\n3. I have moderate pain or discomfort\n4. I have severe pain or discomfort\n5. I have extreme pain or discomfort": "<<EQ5D_DISCOMFORT>>"
        }
    ],
}

eq5d_anxiety_depression = {
    "title": "Anxiety/Depression",
    "type": "list",
    "value": [
        {
            "1. I am not anxious or depressed\n2. I am slightly anxious or depressed\n3. I am moderately anxious or depressed\n4. I am severely anxious or depressed\n5. I am extremely anxious or depressed": "<<EQ5D_DEPRESSION>>"
        }
    ],
}

total_health = {
    "title": "",
    "type": "list",
    "description": "We would like to know how good or bad your health is TODAY.\nThis scale is numbered from 9 to 100.\n100 means the best health you can imagine.\n0 means the worst health you can imagine.\nMark an X on the scale to indicate how your health is TODAY.\nNow, please write the number you marked on the scale in the box below.",
    "value": [{"YOUR HEALTH TODAY =": "<<EQ5D_TOTAL>>"}],
}

sections = [
    {
        "title": "Demographic/Clinical Information",
        "type": "section",
        "subsections": [
            demo,
            medical_history,
            premorbid_status,
            imaging,
            stroke_information,
            other_information,
        ],
    },
    {
        "title": "Edinburgh Handedness Inventory",
        "type": "section",
        "subsections": [handedness, edinburgh_table, edinburgh_handedness_score],
    },
    {
        "title": "Clinical Tests",
        "type": "section",
        "subsections": [mrs, safe, total_safe_score],
    },
    {
        "title": "FUGL-MEYER ASSESSMENT OF STROKE RECOVER",
        "type": "section",
        "description": "• Explain tasks verbally and demonstrate. Patient should perform tasks on the unimpaired side first and tasks should be scored against\nunimpaired side (if possible). Repeat each task up to three times and score for best performance.\n• Unless otherwise specified:\n• MAY NOT assist patient in attaining final position.\n• Each task must be performed as a distinct unit with at least 3 seconds separating all tasks.\nONLY IF DOING IMU study: Mark if failed to reach starting position but ask to attempt motion even if starting cannot be achieved",
        "subsections": [fugl_total, upper_extremity],
    },
    {
        "title": "ACTION RESEARCH ARM TEST (ARAT)",
        "type": "section",
        "description": "*If easiest task score = 0 (i.e. items 2, 8, 12, 18), all else = 0 for this subscale.\nNo other tasks administered.\n*If easiest task > 0, test all remaining items in that subscale. Move to next subscale.\nApplies to all subscales.",
        "subsections": [
            grasp_subscale,
            grip_subscale,
            pinch_subscale,
            gross_movement_subscale,
        ],
    },
    {"title": "Stroke Impact Scale (SIS-16)", "type": "section", "subsections": [sis]},
    {
        "title": "MONTREAL COGNITIVE ASSESSMENT (MOCA®)",
        "type": "section",
        "subsections": [],
    },
    {"title": "NIH Stroke Scale", "type": "section", "subsections": [nih, nih_summary]},
    {
        "title": "EQ5D Quality of Life Inventory",
        "type": "section",
        "description": "Under each heading, please choose the ONE sentence that best describes your health TODAY.",
        "subsections": [
            eq5d_mobility,
            eq5d_self_care,
            eq5d_usual_activities,
            eq5d_pain_discomfort,
            eq5d_anxiety_depression,
            total_health,
        ],
    },
]

final_dict = {"visit": "1", "sections": sections}

json_output = json.dumps(final_dict, indent=4)

# Print the JSON output

# Optionally, write to a file
with open("pdf.json", "w") as json_file:
    json_file.write(json_output)
