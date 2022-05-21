import { actionTypes } from "../actions";

const initialState = {
    secret: "",
    qrImgUrl:"",
    //kyc form step1
    doc_type:"",
    doc_front:"",
    doc_back:"",
    national_id:"",
    //kyc form step2
    selfie:"",
    //kyc form step3
    firstName:"",
    middleName:"",
    lastName:"",
    panNo:"",
    country:"",
    zip:"",
    city:"",
    kyc_selfie_path:"",
    kyc_doc_path_front:"",
    kyc_doc_path_back:"",
    kyc_national_doc_path:""

};

const security = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.KYC_FORM_UPDATE:
      return {
       
        ...state,[action.payload.prop]: action.payload.value
        
      };
      
    
    case actionTypes.SAVE_GOOGLE_AUTH_DETAIL:
      return {
       
        secret: action.payload.secret,
        qrImgUrl: action.payload.qrImgUrl,

        
      };
      case actionTypes.KYC_FORM_CLEAR:
        return {
         
          doc_type:"",
          doc_front:"",
          doc_back:"",
          national_id:"",
          selfie:"",

          firstName:"",
          middleName:"",
          lastName:"",
          panNo:"",
          country:"",
          zip:"",
          city:"",
          kyc_selfie_path:""
  
          
        };
      
   

    default:
      return state;
  }
};

export default security;
