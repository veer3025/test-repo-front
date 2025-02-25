import { FC , useContext} from "react";
import { Dropdown, Media, DropdownToggle, DropdownMenu } from "reactstrap";
import {CreatePostPostPanelContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface} from '@/Common/CreatePost/types/postPanel'
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
interface TaggedUserDropDownInterface {
  drpdwnSharedUsrOpen:boolean,
  setDrpdwnSharedUsrOpen:React.Dispatch<React.SetStateAction<boolean>>,
  sharedUsersData:any[]
}
const SharedUserDropDown : FC<TaggedUserDropDownInterface> = (props) =>{
  //context data begin
  const {defaultUserImagePath = ""} : PostPanelContextInterface =  useContext(CreatePostPostPanelContext);
  //context data end
  
  //props begin
  const {
    drpdwnSharedUsrOpen,
    setDrpdwnSharedUsrOpen,
    sharedUsersData
  } = props;
  //props end
  const taggedUsersDataLength : number = sharedUsersData?.length ?? 0;
  return(
    <Dropdown isOpen={drpdwnSharedUsrOpen} toggle={() => setDrpdwnSharedUsrOpen((prev) => !prev )} className="d-inline">
      <DropdownToggle>
        <span className={`ms-1 d-flex gap-1 ${ drpdwnSharedUsrOpen ? 'fw-bold' : '' }`}> 
        <DynamicFeatherIcon iconName="Lock" className="iw-18 ih-18"/> Shared With
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <ul className="taggedUL">
          {sharedUsersData.map((record : any, index) => (
            <li className="taggedLI" key={record.id}>
              <div className="imgDiv">
                <img className="img-fluid user-img" src = {record.user_profile_photo} />
              </div>
              <div className="nameDiv text-secondary">
                <span className="name">{ record.user_full_name }</span>
                <span className="email">{ record.email }</span>
              </div>
            </li>
          ))}
        </ul>
      </DropdownMenu>
    </Dropdown>
  );
}

export default SharedUserDropDown;