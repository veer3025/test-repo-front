import { FC , useContext} from "react";
import { Dropdown, Media, DropdownToggle, DropdownMenu } from "reactstrap";
import {CreatePostPostPanelContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface} from '@/Common/CreatePost/types/postPanel'

interface TaggedUserDropDownInterface {
  drpdwnTaggedUsrOpen:boolean,
  setDrpdwnTaggedUsrOpen:React.Dispatch<React.SetStateAction<boolean>>,
  taggedUsersData:any[]
}
const TaggedUserDropDown : FC<TaggedUserDropDownInterface> = (props) =>{
  //context data begin
  const {defaultUserImagePath = ""} : PostPanelContextInterface =  useContext(CreatePostPostPanelContext);
  //context data end
  
  //props begin
  const {
    drpdwnTaggedUsrOpen,
    setDrpdwnTaggedUsrOpen,
    taggedUsersData
  } = props;
  //props end
  const taggedUsersDataLength : number = taggedUsersData?.length ?? 0;
  return(
    <Dropdown isOpen={drpdwnTaggedUsrOpen} toggle={() => setDrpdwnTaggedUsrOpen((prev) => !prev )} className="d-inline">
      <DropdownToggle>
        <span className="ms-1 d-inline-block fw-bold"> 
          & {taggedUsersDataLength -1} {`${taggedUsersDataLength == 2 ? 'other' :'others'}`}
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <ul className="taggedUL">
          {taggedUsersData.filter((record:any,index:number)=>{ return index >= 1}).map((record : any, index) => (
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

export default TaggedUserDropDown;