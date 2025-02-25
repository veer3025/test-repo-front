// MTak Begin
import { FC ,useEffect } from "react";
import { Progress } from 'reactstrap'; 
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
// import Image from "next/image";
// import { v4 as uuidv4 } from 'uuid';
interface ChatFilePreivewInterFace {
  chatMessageObject: any,
  handleRemoveFile : any,
  setBActive : React.Dispatch<React.SetStateAction<boolean>>;
  chatFileUploadProgress : number;
  isSubmitting : boolean;
}
const defaultFileLogoPath = '/assets/default/file_logo_chat.png';
const ChatFilePreivew: FC<ChatFilePreivewInterFace> = (props) => {
  //props begin
  const {chatMessageObject,handleRemoveFile,setBActive,chatFileUploadProgress,isSubmitting} = props;
  const fileObj : any = chatMessageObject?.files[0] ?? [];
  const fileMimetype : any = fileObj.file.type;
  const fileName : string = fileObj.file.name;

  useEffect(()=>{
    setBActive(()=>{
      return true;
    });
  },[]);

  //assets/default/file_logo_chat.png
  //props end
  return(
    <div className = "chatFilePreviewDiv">
      <div className="containerr" title={fileName}>
        {
          fileMimetype.toLowerCase().includes("image/") 
          ?
          <img className = "_img" src={fileObj.file ? URL.createObjectURL(fileObj.file ) : ''} alt="preview" />
          :
          <img className = "_img" src={defaultFileLogoPath} alt="preview" />
        }
        <button disabled = {isSubmitting} className = "no_style_button iconX" onClick = { handleRemoveFile }>
          <DynamicFeatherIcon className = "" iconName="X"/>
        </button>
      </div>
      <Progress striped className="my-2" color="success" value={chatFileUploadProgress}>{chatFileUploadProgress}%</Progress>
    </div>
  );
}

export default ChatFilePreivew;