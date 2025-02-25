import { FC, useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Offcanvas, OffcanvasHeader, OffcanvasBody, Col, Row, FormGroup, Label, Input, FormText, FormFeedback, Button, Media } from "reactstrap";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

import "./cyb.scss";

import { getInstituteListCombo } from "@/libs/institute/getInstituteListCombo";
import { getBatchListCombo } from "@/libs/batch/getBatchListCombo";
import { getTemplateList } from "@/libs/template/getTemplateList";
import { getYearBookUserList } from "@/libs/user/getYearBookUserList";

import PreviewTemplateModal from "./PreviewTemplateModal";
import UserListModal from "./UserListModal";
import UserImportResponseModal from "./UserImportResponseModal";

const getLastDate = ():string => {

  const current_dt = new Date();
  const last_dt    = current_dt.setDate(current_dt.getDate() + 20);
  
  return format(new Date(last_dt), 'yyyy-MM-dd');
}

const curr_year = format(new Date(), 'yyyy');

var initialData = {
  
  step1 : {
    year_book_id : 0, steps : 0, institution : '', institution_id : 0, yb_name : '', yb_logo_old  : '', yb_logo : '', 
    yb_logo_prev : '', yb_logo_file : [], yb_batch : '', yb_batch_id : 0, yb_year : '', last_date : getLastDate(), 
  },
  
  step2 : {

    template_id : 0, template_name : '', template_type : ''
  },
   
  step3 : {

    excel_file : [], imported_users : [], already_exists : [], import_failed : [], yb_users : []
  },

  step4 : {

  }
};

var defErrInfo = { status : 0, msg : ''};

var formErrors = {

  institution : { ...defErrInfo }, yb_year : { ...defErrInfo }, yb_logo : { ...defErrInfo }, yb_batch : { ...defErrInfo },
  yb_name : { ...defErrInfo }, last_date : { ...defErrInfo }, template_id : { ...defErrInfo }, 
  xls_data : { ...defErrInfo },  
};

var searchSuggestion:React.CSSProperties = {

  height: '0px', backgroundColor: 'rgba(var(--white), 1)', position:"absolute", width: '95%', borderRadius: '5px',
  boxShadow: '0 6px 30px -10px #d5dbed', top : '65px', overflow: 'auto', padding:"0px", 
  transition: 'height 359ms cubic-bezier(0.27, 0.7, 0, 0.99)', zIndex : 0
};

var searchSuggestionShow:React.CSSProperties = {

  height: '180px', backgroundColor: 'rgba(var(--white), 1)', position:"absolute", width: '95%', borderRadius: '5px',
  boxShadow: '0 6px 30px -10px #d5dbed', top : '65px', overflow: 'auto', padding:"0px",
  transition: 'height 399ms cubic-bezier(0.27, 0.7, 0, 0.99)', zIndex : 999
};

var searchList:React.CSSProperties = {

  paddingLeft : "0px", listStyleType : "none", marginBottom : "0px", paddingRight : "0px"
};

var searchListItem:React.CSSProperties = { 

  margin: "0 6px", padding: "6px 3px", display: "flex", alignItems : "center", transition: "all 0.5s ease",
  cursor:"pointer"
};

var srchListItemH5:React.CSSProperties = {
  fontFamily : "'Montserrat', sans-serif", color: "rgba(var(--title-color), 1)", textTransform : "capitalize",
  fontWeight : "600"
};

var tplListItem:React.CSSProperties = {
  backgroundColor : "rgba(var(--theme-light), 1)"
};

var tplTxtRoate:React.CSSProperties = {

  width:'60%', height: '60%', marginTop : '-3%', marginLeft : '-20%', transform: 'rotate(-45deg)'
};

const CreateYearBookModal: FC<any> = ({ showModal, toggleModal, userDetails, reloadDashboard }) => {

  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [ybStepNo, setYbStepNo] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [ybData, setYbData]     = useState(initialData);
  const [errors, setErrors] = useState(formErrors);
  const [isSubmitInProcess1, setIsSubmitInProcess1] = useState(false);
  const [isSubmitInProcess2, setIsSubmitInProcess2] = useState(false);
  const [isSubmitInProcess3, setIsSubmitInProcess3] = useState(false);
  const [isSubmitInProcess4, setIsSubmitInProcess4] = useState(false);
  const [loadedInstituteList, setLoadedInstituteList] = useState([]);
  const [instituteSearch, setInstituteSearch] = useState('');
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [isInstituteVisible, setIsInstituteVisible] = useState(false);
  const [loadedBatchList, setLoadedBatchList] = useState([]);
  const [batchSearch, setBatchSearch] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [isBatchVisible, setIsBatchVisible] = useState(false);
  const [loadedTemplateList, setLoadedTemplateList] = useState([]);  
  const [showTplPrevModal, setShowTplPrevModal] = useState(false);
  const [previewTplInfo, setPreviewTplInfo] = useState({});
  const [loadedExlCols, setLoadedExlCols] = useState([]);
  const [loadExlData, setLoadExlData] = useState([]);
  const [showUsrListModal, setShowUsrListModal] = useState(false);
  const [showImpRespModal, setShowImpRespModal] = useState(false);
  const [usrImpRespData, setUsrImpRespData] = useState({});
  const [isUserImportInProcess, setIsUserImportInProcess] = useState(false);
  const [notReviewed, setNotReviewed] = useState(true);
  const [reviewChkToggle, setReviewChkToggle] = useState(true);
  
  const router  = useRouter();

  const setYbSteps = async (ybd:any = {}) => {
    
    if(ybd?.steps??0) {

      setStepsCompleted(ybd?.steps);

      const yb_users = await getYearBookUserList({year_book_id : ybd.id});

      setYbData((prev) => {
          
        const stp1 = { year_book_id : ybd.id, steps : ybd.steps, institution : ybd.inst_nm, 
          institution_id : ybd.institution_id, yb_name : ybd.y_nm, yb_logo_old : ybd.logo, yb_logo : '', 
          yb_logo_prev : ybd.logo, yb_logo_file : [], yb_batch : ybd.btch_nm, yb_batch_id : ybd.batch_id, 
          yb_year : ybd.yearbook_year, last_date : ybd.last_dt };
        
        const stp2 = { template_id : ybd.template_id, template_name : ybd.template_name, 
                       template_type : ybd.template_type };
        
        return {...prev, step1 : {...prev.step1, ...stp1}, step2 : {...prev.step2, ...stp2}, 
                step3 : {...prev.step3, yb_users : yb_users } }; 
      });
    }
  };

  useEffect(() => {
    
    const LoadRequiredElements = async () => {

      var curr_step = 0;

      const instListComboItems = await getInstituteListCombo();

      if(instListComboItems && (instListComboItems.length??0)) {
        
        setLoadedInstituteList(instListComboItems);
      }

      const batchListComboItems = await getBatchListCombo();

      if(batchListComboItems && (batchListComboItems.length??0)) {
        
        setLoadedBatchList(batchListComboItems);
      }

      const templateListItems = await getTemplateList();

      if(templateListItems && (templateListItems.length??0)) {
        
        setLoadedTemplateList(templateListItems);
      }      

      const opt    = { method : 'POST', body: JSON.stringify({cdt : format(new Date(), 'yyyy-MM-dd')}) }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/get-year-book-info`, opt)
      .then(response => response.json())
      .then(async res_data => {

        if(res_data && (res_data.length??0) && (res_data[0]?.id??0)) {
          
          curr_step = res_data[0]?.steps??0; 

          setYbSteps({ ...res_data[0] });
        }
      })
      .catch(error => {
      });

      if(!isContentLoaded) {

        setIsContentLoaded(true);
      }
      
      if(ybStepNo == 0) {

        curr_step = curr_step < 4 ? curr_step+1 : curr_step;  
        setYbStepNo(curr_step);
      }
    }

    if(showModal) {

      LoadRequiredElements();
    }
  }, [showModal, ybStepNo]);

  useEffect(() => {
    
    const i_srch_s = instituteSearch?.trim()?.toLowerCase()
    var is_cmp_vis = false;

    const filteredData = loadedInstituteList?.filter((inst_list:any) => {
      
      const i_name_c = inst_list?.name?.trim().toLowerCase()
      
      if(i_srch_s == '') {
        
        return false;
      }
      else {

        if((i_name_c.indexOf(i_srch_s)) !== -1) {

          is_cmp_vis = true;
          return true;
        }
        else {
          return false;
        } 
      }
    });

    setFilteredInstitutes(filteredData);
    setIsInstituteVisible(is_cmp_vis);

  }, [instituteSearch]);

  useEffect(() => {
    
    const b_srch_s = batchSearch?.trim()?.toLowerCase()
    var is_cmp_vis = false;

    const filteredData = loadedBatchList?.filter((batch_list:any) => {
      
      const b_name_c = batch_list?.name?.trim().toLowerCase()
      
      if(b_srch_s == '') {
        
        return false;
      }
      else {

        if((b_name_c.indexOf(b_srch_s)) !== -1) {

          is_cmp_vis = true;
          return true;
        }
        else {
          return false;
        } 
      }
    });

    setFilteredBatches(filteredData);
    setIsBatchVisible(is_cmp_vis);

  }, [batchSearch]);

  useEffect(() => {

    setLoadedTemplateList([]);
    setLoadedTemplateList(loadedTemplateList);

  },[ybData?.step2?.template_id]);

  useEffect(() => {

    extractXlsData();

  },[ybData?.step3?.excel_file]);

  const setInstituteCombo = (institute_nm:any) => {

    setInstituteSearch(institute_nm);
      
    setYbData((prev) => {
      const sb_data = { institution : institute_nm, institution_id : 0 };
      
      return {...prev, step1 : {...prev.step1, ...sb_data} }
    });

    validateInstitute();
  }

  const setSelectedInstitute = (inst_data:any) => {

    if((inst_data?.id??0) && (inst_data?.name??0) && (inst_data?.name?.trim() != '')) {
      
      setYbData((prev) => {
        
        const sb_data = { institution : inst_data?.name?.trim(), institution_id : inst_data?.id };
        const stp1_dt = {  };

        return {...prev, step1 : {...prev.step1, ...sb_data} } 
      });

      setIsInstituteVisible(false);
    }

    validateInstitute();
  }
  
  const setBatchCombo = (batch_nm:any) => {

    setBatchSearch(batch_nm);

    setYbData((prev) => {
      const sb_data = { yb_batch : batch_nm, yb_batch_id : 0 };
      
      return {...prev, step1 : {...prev.step1, ...sb_data} }
    });

    validateBatch();
  }

  const setSelectedBatch = (btch_data:any) => {

    if((btch_data?.id??0) && (btch_data?.name??0) && (btch_data?.name?.trim() != '')) {
      
      setYbData((prev) => {
        
        const sb_data = { yb_batch : btch_data?.name?.trim(), yb_batch_id : btch_data?.id };
        
        return {...prev, step1 : {...prev.step1, ...sb_data} } 
      });

      setIsBatchVisible(false);
    }

    validateBatch();
  }

  const setFormField = (fld_nm:any = '', fld_val:any = '') => {
    
    if(fld_nm == 'yb_batch') {

      setYbData((prev) => {

        return { ...prev, step1 : { ...prev.step1, yb_batch : fld_val } }; 
      });
    }
    else if(fld_nm == 'yb_year') {

      setYbData((prev) => {

        return { ...prev, step1 : { ...prev.step1, yb_year : fld_val } }; 
      });
    }
    else if(fld_nm == 'yb_name') {

      setYbData((prev) => {

        return { ...prev, step1 : { ...prev.step1, yb_name : fld_val } }; 
      });
    }
    else if(fld_nm == 'last_date') {

      setYbData((prev) => {

        return { ...prev, step1 : { ...prev.step1, last_date : fld_val } }; 
      });
    }
    else if(fld_nm == 'yb_logo') {

      setYbData((prev) => {

        return { ...prev, step1 : { ...prev.step1, yb_logo : fld_val } }; 
      });
    }
  }

  const setLogoPreview = (files:any = []) => {
    
    var file_src = '';
    
    if ((files.length??0)) {

      var obj_logo = document?.getElementById('yb_logo') as HTMLInputElement;

      if(files[0].type.startsWith('image')) {

        const ext = (files[0]?.name??0) ? files[0]?.name?.split('.')?.slice(-1)[0]?.toLowerCase() : ''; 
        
        if(ext != 'jpg' && ext != 'jpeg' && ext != 'png') {

          const err_msg = 'Invalid File Type. valid file types are : *.jpg, *.jpeg, *.png...!!';

          setErrors((prev) => { return {...prev, yb_logo : {status : 2, msg : err_msg} } });
          setFormField('yb_logo', '');
          
          if(obj_logo??0) {

            obj_logo.value = '';
          }

        } else if(files[0].size > (512 * 1024)) {

          setErrors((prev) => { return {...prev, yb_logo : {status : 2, msg : 'Valid max file size is : 512 Kb'} } });
          setFormField('yb_logo', '');

          if(obj_logo??0) {

            obj_logo.value = '';
          }
        }
        else {
          
          file_src = URL.createObjectURL(files[0]);
          
          setErrors((prev) => { return {...prev, yb_logo : {status : 1, msg : ''} } });
        }
      }
      else {

        const err_msg = 'Invalid File Type. valid file types are : *.jpg, *.jpeg, *.png...!!';

        setErrors((prev) => { return {...prev, yb_logo : {status : 2, msg : err_msg} } });
        setFormField('yb_logo', '');

        if(obj_logo??0) {

          obj_logo.value = '';
        }
      }
    }
    else {

      setErrors((prev) => { return {...prev, yb_logo : {status : 0, msg : ''} } });
    }
    
    setYbData((prev) => {

      var logo_prv = (file_src??0) ? file_src : ybData.step1.yb_logo_old;
      return { ...prev, step1 : { ...prev.step1, yb_logo_prev : logo_prv, yb_logo_file : files} }; 
    });
  }

  const validateInstitute = () => {

    if(ybData.step1.institution.trim() == '') {
      
      const err_msg = 'Select/Enter Institute...!!';
      
      setErrors((prev) => { return {...prev, institution : {status : 2, msg : err_msg} } });
      document?.getElementById('institution')?.focus();
      
      return false;
    }
    
    setErrors((prev) => { return {...prev, institution : {status : 1, msg : ''} } });

    return true;
  }

  const validateYbName = () => {

    if(ybData.step1.yb_name.trim() == '') {
      
      const err_msg = 'Enter Year Book Name...!!';
      
      setErrors((prev) => { return {...prev, yb_name : {status : 2, msg : err_msg} } });
      document?.getElementById('yb_name')?.focus();

      return false;
    }
    
    setErrors((prev) => { return {...prev, yb_name : {status : 1, msg : ''} } });

    return true;
  }

  const validateYbLogo = () => {
    
    if(ybData?.step1?.yb_logo?.trim() == '') {

      setErrors((prev) => { return {...prev, yb_logo : {status : 0, msg : ''} } });

    }
    else if(errors.yb_logo.status == 2) {

      return false;
    }

    return true;
  }

  const validateBatch = () => {

    if(ybData.step1.yb_batch.trim() == '') {
      
      const err_msg = 'Enter Batch...!!';
      
      setErrors((prev) => { return {...prev, yb_batch : {status : 2, msg : err_msg} } });
      document?.getElementById('yb_batch')?.focus();

      return false;
    }
    
    setErrors((prev) => { return {...prev, yb_batch : {status : 1, msg : ''} } });
    
    return true;
  }

  const validateYear = () => {
    
    if(parseInt(ybData.step1.yb_year) == 0) {
      
      let err_msg = 'Enter Year...!!';
      
      setErrors((prev) => { return {...prev, yb_year : {status : 2, msg : err_msg} } });
      document?.getElementById('yb_year')?.focus();
      
      return false;
    }

    const yb_yr  = parseInt(ybData.step1.yb_year);
    const cr_yr  = parseInt(curr_year);
    
    if(yb_yr < (cr_yr - 100) || yb_yr > cr_yr) {
      
      let err_msg = `Enter a Valid Year [Between ${(cr_yr - 100)} - ${cr_yr}]...!!`;
      
      setErrors((prev) => { return {...prev, yb_year : {status : 2, msg : err_msg} } });
      document?.getElementById('yb_year')?.focus();

      return false;
    }
    
    setErrors((prev) => { return {...prev, yb_year : {status : 1, msg : ''} } });

    return true;
  }

  const validateLastDate = () => {

    const last_date = ybData.step1.last_date.trim(); 
    let err_msg     = '';

    if(last_date == '') {
      
      err_msg = 'Enter Last Date...!!';
      
      setErrors((prev) => { return {...prev, last_date : {status : 2, msg : err_msg} } });
      document?.getElementById('last_date')?.focus();

      return false;
    }
    
    const cur_dt_no = format(new Date(), 'yyyyMMdd'); 
    const [lst_yr, lst_mn, lst_dy] = last_date.split('-');
    const lst_dt_no  = (parseInt(lst_yr) * 10000) + (parseInt(lst_mn) * 100) + (parseInt(lst_dy) * 1); 
    
    if(lst_dt_no < parseInt(cur_dt_no)) {

      err_msg = `Invalid Last Date, It must not be less than Current Date [${format(new Date(), 'dd/MM/yyyy')}]...!!`;
      
      setErrors((prev) => { return {...prev, last_date : {status : 2, msg : err_msg} } });
      document?.getElementById('last_date')?.focus();

      return false;
    }

    setErrors((prev) => { return {...prev, last_date : {status : 1, msg : ''} } });

    return true;  
  }

  const validateForm1 = () => {
    
    document?.getElementById('btnSbmt1')?.focus();
    
    if(!validateInstitute()) {

      return false;
    }
    
    if(!validateYbName()) {

      return false;
    }

    if(!validateYbLogo()) {

      return false;
    }

    if(!validateBatch()) {

      return false;
    }
    
    if(!validateYear()) {

      return false;
    }
    
    if(!validateLastDate()) {

      return false;
    }

    return true;
  };
  
  const formSubmitHandle1 = async (event: FormEvent<HTMLFormElement>) => {
    
    event.preventDefault();
    
    if(validateForm1()) {

      setIsSubmitInProcess1(true);

      const form_data = new FormData();

      const steps     = (ybData?.step1?.steps > ybStepNo) ? ybData?.step1?.steps : ybStepNo;  

      form_data.append('user_id', userDetails.id+'');
      form_data.append('year_book_id', ybData.step1.year_book_id+'');
      form_data.append('steps', steps+'');
      form_data.append('institution', ybData.step1.institution+'');
      form_data.append('institution_id', ybData.step1.institution_id+'');
      form_data.append('yb_name', ybData.step1.yb_name+'');
      form_data.append('yb_logo_old', ybData.step1.yb_logo_old+'');
      form_data.append('yb_logo', ybData.step1.yb_logo);
      form_data.append('yb_logo_file', ybData.step1.yb_logo_file[0]);
      form_data.append('yb_batch', ybData.step1.yb_batch+'');
      form_data.append('yb_batch_id', ybData.step1.yb_batch_id+'');
      form_data.append('yb_year', ybData.step1.yb_year+'');
      form_data.append('last_date', ybData.step1.last_date+'');

      const opt    = { method : 'POST', body: form_data }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/save-year-book-details`, opt)
      .then(response => response.json())
      .then(async res_data => {

        if(res_data.status === 1) {

          toast.success(res_data?.message??'Saved Successful !!');
          
          setYbData((prev) => {
          
            const sb_data = { year_book_id : res_data?.year_book_id??0 };
  
            return {...prev, step1 : {...prev.step1, ...sb_data} } 
          });
  
          setYbStepNo(ybStepNo+1);
        }
        else {

          if(res_data?.message??0) {
          
            toast.error(res_data?.message);
          } 
          else {
  
            toast.error('Something went wrong...!!');
          }
        }
      })
      .catch(error => {

        toast.error(error ?? 'Something went wrong ...!!')
      });
      
      setIsSubmitInProcess1(false);
    }
  };

  const validateYearBookId = () => {

    if(ybData.step1.year_book_id == 0) {
      
      const err_msg = 'Year Book Id not found...!!';
      
      setErrors((prev) => { return {...prev, template_id : {status : 2, msg : err_msg} } });
      
      return false;
    }
    
    setErrors((prev) => { return {...prev, template_id : {status : 1, msg : ''} } });

    return true;
  };

  const validateTemplate = () => {

    if(ybData.step2.template_id == 0) {
      
      const err_msg = 'Select a Template before proceeding...!!';
      
      setErrors((prev) => { return {...prev, template_id : {status : 2, msg : err_msg} } });
      
      return false;
    }
    
    setErrors((prev) => { return {...prev, template_id : {status : 1, msg : ''} } });

    return true;
  };  

  const validateForm2 = () => {
    
    document?.getElementById('btnSbmt2')?.focus();
    
    if(!validateYearBookId()) {

      return false;
    }

    if(!validateTemplate()) {

      return false;
    }

    return true;
  };

  const formSubmitHandle2 = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    if(validateForm2()) {

      setIsSubmitInProcess2(true);

      const form_data = new FormData();
      const steps     = (ybData?.step1?.steps > ybStepNo) ? ybData?.step1?.steps : ybStepNo;

      form_data.append('user_id', userDetails.id+'');
      form_data.append('year_book_id', ybData.step1.year_book_id+'');
      form_data.append('steps', steps+'');
      form_data.append('template_id', ybData.step2.template_id+'');

      const opt = { method : 'POST', body: form_data }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/save-selected-template`, opt)
      .then(response => response.json())
      .then(async res_data => {

        if(res_data.status === 1) {

          toast.success(res_data?.message??'Template Selected Successfully !!');
          
          setYbStepNo(ybStepNo+1);
        }
        else {

          if(res_data?.message??0) {
          
            toast.error(res_data?.message);
          } 
          else {
  
            toast.error('Something went wrong...!!');
          }
        }
      })
      .catch(error => {

        toast.error(error ?? 'Something went wrong ...!!')
      });

      setIsSubmitInProcess2(false);
    }
  };
  
  const tplTypeClsFree = 'text-light bg-primary d-flex align-items-center text-center justify-content-center';
  const tplTypeClsPaid = 'text-light bg-danger d-flex align-items-center text-center justify-content-center';

  const toggleTplPrevModal = () => setShowTplPrevModal(!showTplPrevModal);
  const toggleUsrListModal = () => setShowUsrListModal(!showUsrListModal);
  const toggleImpRespModal = () => setShowImpRespModal(!showImpRespModal);

  const validateXlsData = (xls_imp_data:any) => {

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    if(xls_imp_data?.length < 2) {

      let err_msg = 'User Data not found...!!';
      
      setErrors((prev) => { return {...prev, xls_data : {status : 2, msg : err_msg} } });
      
      setLoadedExlCols([]);
      setLoadExlData([]);

      return false;
    }
    
    setErrors((prev) => { return {...prev, xls_data : {status : 1, msg : ''} } });

    return true;
  };

  const extractXlsData = () => {
    
    if((ybData.step3.excel_file??0) && (ybData.step3.excel_file?.length??0)) {
      
      if(ybData.step3.excel_file[0]??0) {

        const excel_file = ybData.step3.excel_file[0];
        
        const reader:FileReader = new FileReader();
    
        reader.onload = async (e:ProgressEvent<FileReader>) => {
      
          const arrayBuffer = (e?.target?.result??0);
      
          if(arrayBuffer instanceof ArrayBuffer) {

            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Assuming the first sheet is what we need
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to JSON with header as the first row      
            const xls_dta:any = sheetData.filter((row:any) => row.some((cell:any) => cell !== null && cell !== ''));             
            
            if(validateXlsData(xls_dta)) {
              
              setLoadedExlCols(xls_dta[0]);
              setLoadExlData(xls_dta);
            }
          }
        };

        reader.readAsArrayBuffer(excel_file);  
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 2097152,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    onDrop: acceptedFiles => {
      
      setLoadedExlCols([]);
      setLoadExlData([]);

      setYbData((prev:any) => {

        return {...prev, step3 : {...prev.step3, excel_file : [], imported_users : [], already_exists : [], 
                import_failed : [] } };
      });
      
      setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

      setYbData((prev:any) => {

        return {...prev, step3 : {...prev.step3, excel_file : acceptedFiles.map(file => Object.assign(file)) } };
      });
    },
    onDropRejected: () => {

      setYbData((prev:any) => {

        return {...prev, step3 : {...prev.step3, excel_file : [], imported_users : [], already_exists : [], 
                import_failed : [] } };
      });

      let err = 'You can only upload 1 file & maximum size of 2 MB.';

      toast.error(err, {
        autoClose: 3000
      });

      setErrors((prev) => { return {...prev, xls_data : {status : 2, msg : err} } });
      setLoadedExlCols([]);
      setLoadExlData([]);
    }
  });

  const handleRemoveFile = (file:any) => {

    //const uploadedFiles = ybData.step3.excel_file;
    //const filtered      = uploadedFiles.filter((i:any) => i.name !== file.name);

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    setYbData((prev:any) => {

      return {...prev, step3 : {...prev.step3, excel_file : [], imported_users : [], already_exists : [], 
              import_failed : [] } };
    });

    setLoadedExlCols([]);
    setLoadExlData([]);
  };
  
  const uploadXlsData = async (xls_cols:any) => {

    setIsUserImportInProcess(true);    
    
    const form_data = { year_book_id : ybData.step1.year_book_id, xls_col_map : xls_cols, user_xls_data : loadExlData};
    const opt       = { method : 'POST', body: JSON.stringify(form_data) };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/import-users`, opt)
      .then(response => response.json())
      .then(async res_data => {

        if(res_data??0) {

          if(res_data?.status == 1) {

            setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

            toast.success(res_data?.message??'Users Imported Successfully !!');
            
            setYbData((prev:any) => {

              return {...prev, step3 : {...prev.step3, excel_file : [], imported_users : res_data?.imported_users??[],
                already_exists : res_data?.already_exists??[], import_failed : res_data?.import_failed??[] 
              } };
            });
          }
          else {

            let err_msg = (res_data?.message??0) ? res_data?.message : 'Something went wrong...!!';
            toast.error(err_msg);
            setErrors((prev) => { return {...prev, xls_data : {status : 2, msg : err_msg} } });
  
            setYbData((prev:any) => {
  
              return {...prev, step3 : {...prev.step3, excel_file : [], imported_users : res_data?.imported_users??[],
                already_exists : res_data?.already_exists??[], import_failed : res_data?.import_failed??[] 
               } };
            });
          }
        }
        else {

          let err_msg = 'Something went wrong...!!';
          toast.error(err_msg);
          setErrors((prev) => { return {...prev, xls_data : {status : 2, msg : err_msg} } });

          setYbData((prev:any) => {

            return {...prev, step3 : {...prev.step3, imported_users : [], already_exists : [], import_failed : [] } };
          });
        }
      })
      .catch(error => {

        let err_msg = error ?? 'Something went wrong ...!!'; 
        toast.error(err_msg);
        setErrors((prev) => { return {...prev, xls_data : {status : 2, msg : err_msg} } });

        setYbData((prev:any) => {

          return {...prev, step3 : {...prev.step3, imported_users : [], already_exists : [], import_failed : []} };
        });
      });
    
    setLoadedExlCols([]);
    setLoadExlData([]);  

    const yb_users = await getYearBookUserList({year_book_id : ybData.step1.year_book_id});

    setYbData((prev) => {
      
      return {...prev, step3 : {...prev.step3, yb_users : yb_users } }; 
    });  

    setIsUserImportInProcess(false);
  }
  
  const importUsers = async () => {
    
    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    var fld:any, val:any, xls_cols:any = { col_nm : '', col_em : '', col_mo : '', col_wn : '', col_gn : ''};

    if(ybData.step1.year_book_id == 0) {
      
      setErrors((prev) => { return {...prev, xls_data : 
        {status : 2, msg : 'Year Book Id not found...!!'} } });
      
      return false;
    }

    fld = document?.getElementById('col_nm');
    val = fld?.value?.trim(); 

    if(val == '') {

      setErrors((prev) => { return {...prev, xls_data : 
                {status : 2, msg : 'Select Excel Sheet Column for Mapping with Name Field...!!'} } });
      
      fld.focus();
      return false;
    }

    xls_cols = { ...xls_cols, col_nm : val };

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    fld = document?.getElementById('col_em');
    val = fld?.value?.trim();

    if(val == '') {

      setErrors((prev) => { return {...prev, xls_data : 
                {status : 2, msg : 'Select Excel Sheet Column for Mapping with Email Field...!!'} } });
      
      fld.focus();
      return false;
    }

    xls_cols = { ...xls_cols, col_em : val };

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    fld = document?.getElementById('col_mo');
    val = fld?.value?.trim();

    if(val == '') {

      setErrors((prev) => { return {...prev, xls_data : 
                {status : 2, msg : 'Select Excel Sheet Column for Mapping with Mobile No. Field...!!'} } });
      
      fld.focus();
      return false;
    }

    xls_cols = { ...xls_cols, col_mo : val };

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    fld = document?.getElementById('col_wn');
    val = fld?.value?.trim();

    if(val == '') {

      setErrors((prev) => { return {...prev, xls_data : 
                {status : 2, msg : 'Select Excel Sheet Column for Mapping with WhatsApp No. Field...!!'} } });
      
      fld.focus();
      return false;
    }

    xls_cols = { ...xls_cols, col_wn : val };

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });

    fld = document?.getElementById('col_gn');
    val = fld?.value?.trim();

    if(val == '') {

      setErrors((prev) => { return {...prev, xls_data : 
                {status : 2, msg : 'Select Excel Sheet Column for Mapping with Gender Field...!!'} } });
      
      fld.focus();
      return false;
    }

    xls_cols = { ...xls_cols, col_gn : val };

    setErrors((prev) => { return {...prev, xls_data : {status : 0, msg : ''} } });
    
    await uploadXlsData(xls_cols);
  };
  
  const downloadSampleFile = () => {
    
    fetch("/sample_user_import.xlsx").then((response) => {
        response.blob().then((blob) => {
            
            const fileURL = URL.createObjectURL(blob);
            
            let alink = document.createElement("a");
            alink.href = fileURL;
            alink.download = "sample_user_import.xlsx";
            alink.click();
        });
    });
  };
  
  const showImportedUsersSuccessfully = () => {

    setShowImpRespModal(true);
    setUsrImpRespData({list_type : 'I', user_list : ybData?.step3?.imported_users??[]});
  };

  const showImportUsersFailed = () => {

    setShowImpRespModal(true);
    setUsrImpRespData({list_type : 'F', user_list : ybData?.step3?.import_failed??[]});
  };

  const showAlreadyExistedUsers = () => {

    setShowImpRespModal(true);
    setUsrImpRespData({list_type : 'E', user_list : ybData?.step3?.already_exists??[]});
  };

  const formSubmitHandle3 = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    setIsSubmitInProcess3(true);

    const form_data = new FormData();
    const steps     = (ybData?.step1?.steps > ybStepNo) ? ybData?.step1?.steps : ybStepNo;

    form_data.append('user_id', userDetails.id+'');
    form_data.append('year_book_id', ybData.step1.year_book_id+'');
    form_data.append('steps', steps+'');
    
    const opt = { method : 'POST', body: form_data }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/save-invite-users`, opt)
      .then(response => response.json())
      .then(async res_data => {

        if(res_data.status === 1) {

          //toast.success(res_data?.message??'Saved Successfully !!');

          setYbStepNo(ybStepNo+1);
        }
        else {

          if(res_data?.message??0) {
          
            toast.error(res_data?.message);
          } 
          else {
  
            toast.error('Something went wrong...!!');
          }
        }
      })
      .catch(error => {

        toast.error(error ?? 'Something went wrong ...!!')
      });

    setIsSubmitInProcess3(false);
  };
  
  const validateForm4 = () => {

    if(notReviewed) {
      
      setReviewChkToggle(false);
      document?.getElementById('is_not_reviewed')?.focus();
    }
    
    return (!notReviewed);
  };

  const formSubmitHandle4 = async (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    if(validateForm4()) {
      
      setReviewChkToggle(true);

      setIsSubmitInProcess4(true);

      const form_data = new FormData();

      form_data.append('user_id', userDetails.id+'');
      form_data.append('year_book_id', ybData.step1.year_book_id+'');
      form_data.append('steps', ybStepNo+'');
    
      const opt = { method : 'POST', body: form_data }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/save-year-book-final`, opt)
        .then(response => response.json())
        .then(async res_data => {

          if(res_data.status === 1) {

            toast.success(res_data?.message??'Year Book Created Successfully !!');
            setTimeout(() => { 
              toggleModal();
              reloadDashboard(true); 
            }, 4000);
          }
          else {

            if(res_data?.message??0) {
            
              toast.error(res_data?.message);
            } 
            else {
    
              toast.error('Something went wrong...!!');
            }
            
            setIsSubmitInProcess4(false);
          }
        })
        .catch(error => {

          toast.error(error ?? 'Something went wrong ...!!');
          setIsSubmitInProcess4(false);
        });

    }
    else {

      document?.getElementById('btnSbmt4')?.focus();
    }  
  };

  return (
  <>
    <Offcanvas direction="end" isOpen={showModal} toggle={toggleModal} className="w-100">
      <OffcanvasHeader toggle={toggleModal}>
        <h2>Create Year Book</h2>
      </OffcanvasHeader>
      <OffcanvasBody className="border-top p-0 m-0 w-100">
        {
          isContentLoaded ?
          <div className="w-100 h-100 p-0 m-0">
            <div className="row w-100 h-100 p-0 m-0">
              <div className="col-lg-3 col-xl-3 h-100 p-0 m-0">
                <div className="calender-section h-100">
                  <div className="event-bottom py-0 h-100 pe-0">
                    <div className="event-content h-25">
                      <h3 className={ybStepNo==1 ? 'text-primary' : ''}>
                        {  1 <= stepsCompleted ? 
                          <i className="text-success fas fa-check-circle"></i> : 
                          <i className="text-danger fas fa-exclamation-circle"></i>
                        }
                        &nbsp;Year Book Info
                      </h3>
                      <p className={ybStepNo==1 ? 'text-primary' : ''}>Fill Yearbook Details</p>
                    </div>
                    <div className="event-content h-25">
                      <h3 className={ybStepNo==2 ? 'text-primary' : ''}>
                        { 2 <= stepsCompleted ? 
                          <i className="text-success fas fa-check-circle"></i> : 
                          <i className="text-danger fas fa-exclamation-circle"></i>
                        }
                        &nbsp;Select Template
                      </h3>
                      <p className={ybStepNo==2 ? 'text-primary' : ''}>Choose your favourite template</p>
                    </div>
                    <div className="event-content h-25">
                      <h3 className={ybStepNo==3 ? 'text-primary' : ''}>
                        { 
                          3 <= stepsCompleted ? 
                            <i className="text-success fas fa-check-circle"></i> : 
                            <i className="text-danger fas fa-exclamation-circle"></i>
                        }
                        &nbsp;Invite Users
                      </h3>
                      <p className={ybStepNo==3 ? 'text-primary' : ''}>You can invite users for your Year Book</p>
                    </div>
                    <div className="event-content h-25">
                      <h3 className={ybStepNo==4 ? 'text-primary' : ''}>
                        { 
                          4 <= stepsCompleted ? 
                          <i className="text-success fas fa-check-circle"></i> : 
                          <i className="text-danger fas fa-exclamation-circle"></i>
                        }
                        &nbsp;Finish
                      </h3>
                      <p className={ybStepNo==4 ? 'text-primary' : ''}>
                        Review Year Book Details, Template, Users and finalise your Year Book    
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-9 col-xl-9 h-100 border-start p-3 m-0">
                {
                  ybStepNo == 1 ? 
                  <div className="w-100 h-100">
                    <form className="theme-form form-sm h-100" onSubmit={(event) => formSubmitHandle1(event)}>
                      <div className="cyb-schoollbar w-100" style={{height:'90%', overflowY:'auto', overflowX:'clip'}}>
                        <Row className="pb-1">
                          <Col sm="12" md="12" lg="12" className="form-group">
                            <div className={`search-box w-100 ${isInstituteVisible ? "custom-dropdown" : ""}`}>
                              <FormGroup>
                                <Label id='lbl_institution'>Institution</Label>
                                <Input type="search" id='institution' name="institution"
                                  value={ybData.step1.institution} placeholder="Select/Enter Institution"
                                  onChange={(event) => {setInstituteCombo(event.target.value);}}
                                  autoComplete="off" autoFocus
                                  style={{width:'100%'}}
                                  className={errors.institution.status == 1 ? 'text-success border-success' : ''} 
                                  invalid = { errors.institution.status == 2 ? true : false }>
                                </Input>
                                <FormFeedback>{errors.institution.msg??''}</FormFeedback>    
                                <div style={(isInstituteVisible ? searchSuggestionShow : searchSuggestion)}>
                                  <ul style={searchList}>
                                    {filteredInstitutes.map((data:any, index) => (
                                      <li key={index} style={searchListItem} onClick={() => { setSelectedInstitute(data) }}>
                                        <Media>
                                          <Media body>
                                            <div>
                                              <h5 className="mt-0" style={srchListItemH5}>{data?.name}</h5>
                                            </div>
                                          </Media>
                                        </Media>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </FormGroup>
                            </div>
                          </Col>
                        </Row>
                        <Row className="pb-1">
                          <Col sm="12" md="12" lg="12" className="form-group">
                            <FormGroup>
                              <Label>Year Book Name</Label>
                              <Input type="text" id='yb_name' name="yb_name"
                                value={ybData.step1.yb_name} placeholder="Enter Year Book Name"
                                onChange={(event) => {setFormField('yb_name', event.target.value); validateYbName();}}
                                autoComplete="off" 
                                className={errors.yb_name.status == 1 ? 'text-success border-success' : ''} 
                                invalid = { errors.yb_name.status == 2 ? true : false }>
                              </Input>
                              <FormFeedback>{errors.yb_name.msg??''}</FormFeedback>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="pb-1">
                          <Col sm="12" md="6" lg="6" className="form-group">
                            <FormGroup>
                              <Label>Upload Logo</Label>
                              <Input type="file" id='yb_logo' name="yb_logo"
                                placeholder="Choose an image file"
                                onChange={(event) => {setErrors(errors); 
                                    setFormField('yb_logo', event.target.value); 
                                    setLogoPreview(event.target.files);
                                  }}
                                autoComplete="off"
                                className={errors.yb_logo.status == 1 ? 'text-success border-success' : ''} 
                                invalid = { errors.yb_logo.status == 2 ? true : false }>
                              </Input>
                              <FormText>Valid File Types are : *.jpg, *.jpeg, *.png and Max file size is : 512 Kb</FormText>
                              <FormFeedback>{errors.yb_logo.msg??''}</FormFeedback>
                            </FormGroup>
                          </Col>
                          <Col sm="12" md="6" lg="6" className="form-group">
                            <div className="d-flex align-items-center v-100">
                              <div className="bg-light border border-light rounded-3 p-2 d-flex align-items-center" 
                                      style={{minHeight:'100px', maxWidth:'300px'}}>
                                {
                                  (ybData.step1.yb_logo_prev??0) 
                                  ? <img src={ybData.step1.yb_logo_prev} className="p-0"
                                            style={{height:'100px'}}/> : 'No Logo Uploaded'
                                  
                                }
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Row className="pb-1">
                          <Col sm="12" md="6" lg="6" className="form-group">
                            <div className={`search-box w-100 ${isBatchVisible ? "custom-dropdown" : ""}`}>
                              <FormGroup>
                                <Label>Batch</Label>
                                <Input type="search" id='yb_batch' name="yb_batch"
                                  value={ybData.step1.yb_batch} placeholder="Select/Enter Batch"
                                  onChange={(event) => {setBatchCombo(event.target.value);}}
                                  autoComplete="off"
                                  className={errors.yb_batch.status == 1 ? 'text-success border-success' : ''} 
                                  invalid = { errors.yb_batch.status == 2 ? true : false }>
                                </Input>
                                <FormFeedback>{errors.yb_batch.msg??''}</FormFeedback>
                                <div style={(isBatchVisible ? searchSuggestionShow : searchSuggestion)}>
                                  <ul style={searchList}>
                                    {filteredBatches.map((data:any, index) => (
                                      <li key={index} style={searchListItem} onClick={() => { setSelectedBatch(data) }}>
                                        <Media>
                                          <Media body>
                                            <div>
                                              <h5 className="mt-0" style={srchListItemH5}>{data?.name}</h5>
                                            </div>
                                          </Media>
                                        </Media>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </FormGroup>
                            </div>
                          </Col>
                          <Col sm="12" md="6" lg="6" className="form-group">
                            <FormGroup>
                              <Label>Year</Label>
                              <Input type="number" id='yb_year' name="yb_year"
                                value={ybData.step1.yb_year} placeholder="Enter Year"
                                onChange={(event) => {setFormField('yb_year', event.target.value);validateYear();}}
                                autoComplete="off" 
                                className={errors.yb_year.status == 1 ? 'text-success border-success' : ''} 
                                invalid = { errors.yb_year.status == 2 ? true : false }>
                              </Input>
                              <FormFeedback>{errors.yb_year.msg??''}</FormFeedback>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="pb-1">
                          <Col sm="12" md="6" lg="6" className="form-group">
                            <FormGroup>
                              <Label>Last Date of Completion</Label>
                              <Input type="date" id='last_date' name="last_date"
                                value={ybData.step1.last_date} placeholder="Enter Last Date"
                                onChange={(event) => {setFormField('last_date', event.target.value); validateLastDate();}}
                                autoComplete="off"
                                className={errors.last_date.status == 1 ? 'text-success border-success' : ''} 
                                invalid = { errors.last_date.status == 2 ? true : false }>
                              </Input>
                              <FormFeedback>{errors.last_date.msg??''}</FormFeedback>
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <div className="w-100 mt-2">
                        {
                          isSubmitInProcess1 ? 
                          <>
                            <Button type='button' className='btn btn-solid' disabled>
                              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                              <span role="status">Wait...</span>
                            </Button>
                          </> : 
                          <>
                            <Button type='submit' id="btnSbmt1" className='btn btn-solid'>Next</Button>
                          </>
                        }
                      </div>
                    </form>    
                  </div> : null
                }
                {
                  ybStepNo == 2 ? 
                  <div className="w-100 h-100">
                    <form className="theme-form form-sm h-100" onSubmit={(event) => formSubmitHandle2(event)}>
                      <div className="cyb-schoollbar w-100" style={{height:'90%', overflowY:'auto', overflowX:'clip'}}>
                        <Row>
                          <Col sm="12" md="12" lg="12" className="form-group h-100" style={{border:'none'}}>
                            <div className="page-list-section w-100 h-100">
                              <Row className="w-100 h-100">
                                {
                                  loadedTemplateList.map((yb_tpl:any, idx) => (
                                    <Col xl="3" lg="4" sm="6" key={idx} className="mb-3">
                                      <div className="list-box mb-1" style={tplListItem}>
                                        <div className="cover-img bg-size blur-up lazyloaded">
                                          <div className={yb_tpl?.template_type == 'F' ? tplTypeClsFree : tplTypeClsPaid} style={tplTxtRoate}>
                                            <b>{yb_tpl?.template_type == 'F' ? 'Free' : 'Paid'}</b>
                                          </div>
                                        </div>
                                        <div className="w-100" style={{
                                          paddingTop:'5px', paddingBottom:'35px', paddingLeft:'10px', paddingRight:'10px',
                                        }}>
                                          <div className="w-100" style={{
                                            textAlign:'center', paddingTop:'4px', paddingBottom:'4px', height:'100px',
                                          }}>
                                            <h4 className="w-100" style={{ 
                                              textTransform : 'capitalize', color : 'rgba(var(--theme-color), 1)',
                                              fontWeight : '500',
                                            }}>
                                              {yb_tpl?.name}
                                            </h4>
                                          </div>
                                          <div className="w-100 text-center">
                                            <Button type="button" color="success" className="btn-view-tpl"
                                              onClick={() => { setPreviewTplInfo({id : yb_tpl?.id}); toggleTplPrevModal(); }}>
                                              Preview
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <Col className="form-group toggle-sec pt-0 d-flex align-items-center justify-content-center">
                                        <label>Select&nbsp;&nbsp;&nbsp;</label>
                                        <div className="button toggle-btn pt-0">
                                          <Input type="checkbox" 
                                            checked={(yb_tpl?.id == ybData?.step2?.template_id) ? false : true} 
                                            className="checkbox" onChange={() => { 
                                              
                                              setYbData((prev) => {
                                                
                                                return {...prev, step2 : {...prev.step2, template_id : yb_tpl?.id } }; 
                                              });
                                              
                                              validateTemplate();
                                            }} />
                                          <div className="knobs"><span /></div>
                                          <div className="layer" />
                                        </div>
                                      </Col>
                                    </Col>
                                  ))
                                }
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <div className="w-100 mt-2">
                        <div className="d-flex align-items-center">
                          {
                            isSubmitInProcess2 ? 
                            <>
                              <Button type='button' className='btn btn-solid' disabled>Previous</Button>
                              <Button type='button' className='btn btn-solid ms-2' disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span role="status"> Wait...</span>
                              </Button>
                            </> : 
                            <>
                              <Button type='button' className='btn btn-solid'
                                onClick={() => { setYbStepNo(ybStepNo-1) }}>Previous</Button>
                              <Button type='submit' id='btnSbmt2' className='btn btn-solid ms-2'>Next</Button>
                              <div className="text-danger ms-3">{errors.template_id.msg??''}</div>
                            </>
                          }
                        </div>
                      </div>
                    </form>
                  </div> : null
                }
                {
                  ybStepNo == 3 ? 
                  <div className="w-100 h-100">
                    <form className="theme-form form-sm h-100" onSubmit={(event) => formSubmitHandle3(event)}>
                      <div className="cyb-schoollbar w-100" style={{height:'90%', overflowY:'auto', overflowX:'clip'}}>
                        <div className="about-profile section-b-space">
                          <div className="card-title d-flex align-items-center justify-content-between pb-2 pt-0">
                            <h3>Import User List</h3>
                            <Button className="btn btn-warning" onClick={downloadSampleFile}>Download Sample File</Button>
                          </div>
                          <Row>
                            <Col sm="12" md="12" lg="12" className="form-group">
                              <div className="pt-3 d-flex flex-row justify-content-between align-items-start h-100"
                               style={{minHeight:'280px'}}>
                                <div {...getRootProps({ className: 'dropzone border rounded-3 p-1 h-100' })} 
                                  style={{cursor:'pointer', width:'27%'}}>
                                  <input name='user_list_excel' {...getInputProps()} />
                                  <div className='d-flex flex-column justify-content-between align-items-center'>
                                    <div 
                                      className='d-flex flex-row justify-content-between align-items-center rounded-3'
                                      style={{width:'48px', height:'48px', backgroundColor:'rgba(var(--theme-light),1)',
                                      }} title="Upload Excel File">
                                      <div className="p-0 mx-auto"><i className='text-secondary fas fa-upload p-0 m-0' /></div>
                                    </div>
                                    <h4 className='my-3' style={{fontWeight:'500'}}>
                                      Click Here To Upload Excel File
                                    </h4>
                                    <div className="text-muted">Allowed *.xls, *.xlsx</div>
                                    <div className="text-muted">Max 1 file and max size of 2 MB</div>
                                    <div className="text-success mt-3 fw-bold">
                                      {
                                        (ybData?.step3?.excel_file?.length)
                                        ?
                                        (ybData?.step3?.excel_file[0] as any)?.name??''
                                        : ''
                                      }
                                    </div>
                                  </div>
                                </div>
                                <div className="border rounded-3 p-1 ms-2 h-100" style={{width:'72%'}}>
                                  <div className="d-flex flex-row justify-content-center align-items-center pt-1 text-danger"
                                    style={{minHeight:'30px'}}>
                                    {errors?.xls_data?.msg??'&nbsp;'}      
                                  </div>
                                  <div className="p-1">
                                    <Row className="pb-1">
                                      <Col sm="12" md="4" lg="4" className="form-group">
                                        <FormGroup>
                                          <Label>Name</Label>
                                          <Input type="select" id="col_nm">
                                            <option value="">Map with Column</option>
                                            {
                                              loadedExlCols?.map(
                                                (exl_col, idx) => (
                                                  <option value={idx} selected={exl_col == 'name' ? true : false}>
                                                    {exl_col}
                                                  </option>
                                                )
                                              )
                                            }
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                      <Col sm="12" md="4" lg="4" className="form-group">
                                        <FormGroup>
                                          <Label>Email</Label>
                                          <Input type="select" id="col_em">
                                            <option value="">Map with Column</option>
                                            {
                                              loadedExlCols?.map(
                                                (exl_col, idx) => (
                                                  <option value={idx} selected={exl_col == 'email' ? true : false}>
                                                    {exl_col}
                                                  </option>
                                                )
                                              )
                                            }
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                      <Col sm="12" md="4" lg="4" className="form-group">
                                        <FormGroup>
                                          <Label>Mobile No.</Label>
                                          <Input type="select" id="col_mo">
                                            <option value="">Map with Column</option>
                                            {
                                              loadedExlCols?.map(
                                                (exl_col, idx) => (
                                                  <option value={idx} selected={exl_col == 'mobile' ? true : false}>
                                                    {exl_col}
                                                  </option>
                                                )
                                              )
                                            }
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                      <Col sm="12" md="4" lg="4" className="form-group">
                                        <FormGroup>
                                          <Label>WhatsApp No.</Label>
                                          <Input type="select" id="col_wn">
                                            <option value="">Map with Column</option>
                                            {
                                              loadedExlCols?.map(
                                                (exl_col, idx) => (
                                                  <option value={idx} selected={exl_col == 'whatsup_number' ? true : false}>
                                                    {exl_col}
                                                  </option>
                                                )
                                              )
                                            }
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                      <Col sm="12" md="4" lg="4" className="form-group">
                                        <FormGroup>
                                          <Label>Gender</Label>
                                          <Input type="select" id="col_gn">
                                            <option value="">Map with Column</option>
                                            {
                                              loadedExlCols?.map(
                                                (exl_col, idx) => (
                                                  <option value={idx} selected={exl_col == 'gender(M/F)' ? true : false}>
                                                    {exl_col}
                                                  </option>
                                                )
                                              )
                                            }
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                    </Row>
                                  </div>
                                  <div className="d-flex flex-row justify-content-center align-items-center pt-1">
                                    {
                                      isUserImportInProcess 
                                      ?
                                      <> 
                                        <Button type="button" color="success" className="btn-view-tpl" disabled>
                                          <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                          <span role="status">Importing...</span>
                                        </Button>
                                        <Button type="button" color="danger" className="btn ms-2" disabled>Cancel</Button>
                                      </>
                                      :
                                      <>
                                        {
                                          (ybData.step3.excel_file.length??0)
                                          ?
                                          (
                                            (loadedExlCols.length??0) 
                                            ?
                                            <>
                                            <Button type="button" color="success" className="btn-view-tpl" onClick={importUsers}>Import</Button>
                                            <Button type="button" color="danger" className="btn btn-view-tpl ms-2" 
                                              onClick={() => handleRemoveFile(ybData.step3.excel_file[0])}>Cancel</Button>
                                            </>
                                            :
                                            <>
                                            <Button type="button" color="success" className="btn-view-tpl" disabled>Import</Button>
                                            <Button type="button" color="danger" className="btn btn-view-tpl ms-2" 
                                              onClick={() => handleRemoveFile(ybData.step3.excel_file[0])}>Cancel</Button>
                                            </>
                                          )
                                          :
                                          null
                                        }
                                      </>
                                    }
                                  </div>
                                </div>
                              </div>
                            </Col>  
                          </Row>
                          <Row className="pb-1">
                            <Col sm="12" md="6" lg="6" style={{border:'none'}}>
                              <ul className="about-list p-0 mt-3">
                                <li>
                                  <h5 className="title w-50 text-primary">
                                    <i className="fas fa-user me-2"></i>Users imported
                                  </h5>
                                  <h5 className="title w-25 text-primary">: {ybData.step3.imported_users?.length??0}</h5>
                                  <h5 className="title w-25 text-primary d-flex flex-row justify-content-end">
                                    {
                                      (ybData.step3.imported_users?.length??0) 
                                      ? 
                                      <Button color="primary" className="btn-view-tpl" 
                                        onClick={showImportedUsersSuccessfully}>View</Button>
                                      :
                                      <Button color="primary" className="" disabled>View</Button>
                                    }
                                  </h5>
                                </li>
                                <li>
                                  <h5 className="title w-50 text-danger">
                                    <i className="fas fa-user me-2"></i>
                                    Import Failed
                                  </h5>
                                  <h5 className="title w-25 text-danger">: {ybData?.step3?.import_failed?.length??0}</h5>
                                  <h5 className="title w-25 text-danger d-flex flex-row justify-content-end">
                                    {
                                      (ybData?.step3?.import_failed?.length??0) 
                                      ? 
                                      <Button color="danger" className="btn-view-tpl" onClick={showImportUsersFailed}>
                                        View
                                      </Button>
                                      :
                                      <Button color="danger" className="" disabled>View</Button>
                                    }
                                  </h5>
                                </li>
                              </ul>
                            </Col>
                            <Col sm="12" md="6" lg="6" style={{border:'none'}}>
                              <ul className="about-list p-0 mt-3">
                                <li>
                                  <h5 className="title w-50 text-warning">
                                    <i className="fas fa-user me-2"></i>User already existed
                                  </h5>
                                  <h5 className="title w-25 text-warning">: {ybData.step3.already_exists?.length??0}</h5>
                                  <h5 className="title w-25 text-warning d-flex flex-row justify-content-end">
                                    {
                                      (ybData?.step3?.already_exists?.length??0) 
                                      ? 
                                      <Button color="warning" className="btn-view-tpl" onClick={showAlreadyExistedUsers}>
                                        View
                                      </Button>
                                      :
                                      <Button color="warning" className="" disabled>View</Button>
                                    }
                                  </h5>
                                </li>
                                <li>
                                  <h5 className="title w-50 text-success">
                                    <i className="fas fa-users me-2"></i>Total Users
                                  </h5>
                                  <h5 className="title w-25 text-success">: {ybData?.step3?.yb_users?.length??0}</h5>
                                  <h5 className="title w-25 text-success d-flex flex-row justify-content-end">
                                    {
                                      (ybData?.step3?.yb_users?.length??0) 
                                      ? 
                                      <Button color="success" className="btn-view-tpl"
                                        onClick={() => { setShowUsrListModal(true);  }}>View</Button>
                                      :
                                      <Button color="success" className="" disabled>View</Button>
                                    }
                                  </h5>
                                </li>
                              </ul>  
                            </Col> 
                          </Row>
                        </div>
                      </div>
                      <div className="w-100 mt-2">
                        <div className="d-flex align-items-center">
                          {
                            isSubmitInProcess3 ? 
                            <>
                              <Button type='button' className='btn btn-solid' disabled>Previous</Button>
                              <Button type='button' className='btn btn-solid ms-2' disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span role="status"> Wait...</span>
                              </Button>
                            </> :
                            (
                              ybData.step3.excel_file.length || isUserImportInProcess ?
                              <>
                                <Button type='button' className='btn btn-solid' disabled>Previous</Button>
                                <Button type='button' className='btn btn-solid ms-2' disabled>Next / Skip</Button>
                              </>
                              :
                              <>
                                <Button type='button' className='btn btn-solid'
                                  onClick={() => { setYbStepNo(ybStepNo-1) }}>Previous</Button>
                                <Button type='submit' id='btnSbmt3' className='btn btn-solid ms-2'>Next / Skip</Button>
                              </>  
                            ) 
                          }
                        </div>
                      </div>
                    </form>
                  </div> : null
                }
                {
                  ybStepNo == 4 ?
                  <div className="w-100 h-100">
                    <form className="theme-form form-sm h-100" onSubmit={(event) => formSubmitHandle4(event)}>
                      <div className="cyb-schoollbar w-100" style={{height:'90%', overflowY:'auto', overflowX:'clip'}}>
                        <div className="about-profile section-b-space">
                          <div className="card-title"><h3>Year Book Details</h3></div>
                          <Row>
                            <Col sm="12" md="8" lg="8" style={{border:'none'}}>
                              <ul className="about-list">
                                <li>
                                  <h5 className="title w-50">Institution</h5>
                                  <h5 className="title text-center" style={{width:'10px'}}>:&nbsp;</h5>
                                  <h6 className="content">{ybData.step1.institution}</h6>
                                </li>
                                <li>
                                  <h5 className="title w-50">Year Book Name</h5>
                                  <h5 className="title text-center" style={{width:'10px'}}>:&nbsp;</h5>
                                  <h6 className="content">{ybData.step1.yb_name}</h6>
                                </li>
                                <li>
                                  <h5 className="title w-50">Batch</h5>
                                  <h5 className="title text-center" style={{width:'10px'}}>:&nbsp;</h5>
                                  <h6 className="content">{ybData.step1.yb_batch}</h6>
                                </li>
                                <li>
                                  <h5 className="title w-50">Year</h5>
                                  <h5 className="title text-center" style={{width:'10px'}}>:&nbsp;</h5>
                                  <h6 className="content">{ybData.step1.yb_year}</h6>
                                </li>
                                <li>
                                  <h5 className="title w-50">Last Date of Completion</h5>
                                  <h5 className="title text-center" style={{width:'10px'}}>:&nbsp;</h5>
                                  <h6 className="content">
                                    {
                                      ybData.step1.last_date??0 
                                      ? format(new Date(ybData.step1.last_date), 'dd MMMM yyyy') : null
                                    }
                                  </h6>
                                </li>
                              </ul>
                            </Col>
                            <Col sm="12" md="4" lg="4" style={{border:'none'}}>
                              <ul className="about-list px-0">
                                <li>
                                  <div className="d-flex align-items-center justify-content-center w-100 h-100">
                                    <div className="bg-light border border-light rounded-3 p-3 d-flex align-items-center" 
                                      style={{minHeight:'150px', maxWidth:'300px'}}>
                                      {
                                        (ybData.step1.yb_logo_prev??0) 
                                        ? <img src={ybData.step1.yb_logo_prev} className="p-0"
                                            style={{height:'150px'}}/> : 'No Logo Uploaded'
                                      }
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </Col>  
                          </Row>
                          <div className="card-title"><h3>Year Book Template</h3></div>
                          <Row>
                            <Col sm="12" md="12" lg="12" className="form-group h-100" style={{border:'none'}}>
                              <div className="page-list-section w-100 h-100">
                                <Row className="w-100 h-100 d-flex flex-row justify-content-center">
                                  <Col xl="3" lg="4" sm="6" className="mb-3">
                                    {
                                      ybData?.step2?.template_id??0 ?
                                      <div className="list-box mb-1" style={tplListItem}>
                                        <div className="cover-img bg-size blur-up lazyloaded">
                                          <div className={ybData?.step2?.template_type == 'F' ? tplTypeClsFree : tplTypeClsPaid} 
                                            style={tplTxtRoate}>
                                            <b>{ybData?.step2?.template_type == 'F' ? 'Free' : 'Paid'}</b>
                                          </div>
                                        </div>
                                        <div className="w-100" style={{
                                          paddingTop:'5px', paddingBottom:'35px', paddingLeft:'10px', paddingRight:'10px',
                                        }}>
                                          <div className="w-100" style={{
                                            textAlign:'center', paddingTop:'4px', paddingBottom:'4px', height:'100px',
                                          }}>
                                            <h4 className="w-100" style={{ 
                                              textTransform : 'capitalize', color : 'rgba(var(--theme-color), 1)',
                                              fontWeight : '500',
                                            }}>
                                              {ybData?.step2?.template_name}
                                            </h4>
                                          </div>
                                          <div className="w-100 text-center">
                                            {
                                              isSubmitInProcess4 ?
                                              <Button type="button" color="success" disabled>Preview</Button>
                                              : 
                                              <Button type="button" color="success" className="btn-view-tpl"
                                                onClick={() => { setPreviewTplInfo({id : ybData?.step2?.template_id}); toggleTplPrevModal(); }}>
                                                Preview
                                              </Button>
                                            }
                                          </div>
                                        </div>
                                      </div>
                                      : null
                                    }
                                  </Col>
                                </Row>
                              </div>
                            </Col>
                          </Row>
                          <div className="card-title"><h3>Year Book Users</h3></div>
                          <Row>
                            <Col sm="12" md="6" lg="6" style={{border:'none'}}>
                              <ul className="about-list">
                                <li>
                                  <h5 className="title w-50 text-success">
                                    <i className="fas fa-users me-2"></i>Total Users
                                  </h5>
                                  <h5 className="title w-25 text-success">: {ybData?.step3?.yb_users?.length??0}</h5>
                                  <h5 className="title w-25 text-success d-flex flex-row justify-content-end">
                                    {
                                      (ybData?.step3?.yb_users?.length??0) 
                                      ?
                                      (
                                        isSubmitInProcess4 ?
                                        <Button color="success" className="" disabled>View</Button> 
                                        : 
                                        <Button color="success" className="btn-view-tpl"
                                          onClick={() => { setShowUsrListModal(true);  }}>View</Button>
                                      )
                                      :
                                      <Button color="success" className="" disabled>View</Button>
                                    }
                                  </h5>
                                </li>
                              </ul>              
                            </Col>
                          </Row>
                          <div className="card-title"><h3>Confirmation</h3></div>
                          <Row>
                            <div className="page-list-section w-100 h-100">
                              <ul className="about-list my-0">
                                <li>
                                  <Col className="form-group toggle-sec pt-0">
                                    <div className="button toggle-btn pt-0">
                                      {
                                      isSubmitInProcess4 
                                      ?
                                      <Input type="checkbox" checked={ notReviewed } className="checkbox" disabled /> 
                                      :
                                      <Input type="checkbox" checked={ notReviewed } id="is_not_reviewed" 
                                        className="checkbox" onChange={() => {
                                          
                                          setNotReviewed(!notReviewed);
                                          setReviewChkToggle(notReviewed);
                                        }} />
                                      }
                                      <div className="knobs"><span /></div>
                                      <div className="layer" />
                                    </div>
                                    <label className={reviewChkToggle ? 'text-dark' : 'review-confirm-animate'}>
                                      &nbsp;Are you sure? You have reviewed all the details.
                                    </label>
                                  </Col>
                                </li>
                              </ul>
                            </div>
                          </Row>
                        </div>  
                      </div>
                      <div className="w-100 mt-2">
                        <div className="d-flex align-items-center">
                          {
                            isSubmitInProcess4 ? 
                            <>
                              <Button type='button' className='btn btn-solid' disabled>Previous</Button>
                              <Button type='button' className='btn btn-solid ms-2' disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span role="status"> Wait...</span>
                              </Button>
                            </> : 
                            <>
                              <Button type='button' className='btn btn-solid'
                                onClick={() => { setYbStepNo(ybStepNo-1) }}>Previous</Button>
                              <Button type='submit' id='btnSbmt4' className='btn btn-solid ms-2'>Finish</Button>
                            </>
                          }
                        </div>
                      </div>
                    </form>
                  </div> 
                  : null
                }
              </div>
            </div>
          </div>
          :
          <div className="loading-text">
            <div>
              <h1 className="animate">Loading</h1>
            </div>
          </div>
        }
      </OffcanvasBody>
    </Offcanvas>
    <PreviewTemplateModal showModal={showTplPrevModal} toggleModal={toggleTplPrevModal} templateInfo={previewTplInfo} />
    <UserListModal showModal={showUsrListModal} toggleModal={toggleUsrListModal} userList={ybData?.step3?.yb_users??[]} />
    <UserImportResponseModal showModal={showImpRespModal} toggleModal={toggleImpRespModal} importResponse={usrImpRespData} />
  </>);
};

export default CreateYearBookModal;
