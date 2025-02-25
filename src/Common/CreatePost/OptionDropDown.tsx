// MTak Begin
import { Href } from "../../utils/constant";
import { FC, useState ,useContext} from "react";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import {CreatePostContextInterface,postObjInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
// import { createPostDropDown } from "@/Data/common";

interface postTypeDropdownInterface {
  icon: "Globe" | "Users" | "User";
  name: string;
  value : string
}

const postTypeDropDown: postTypeDropdownInterface[] = [
  { icon: "Globe", name: "Public" , value : "PUBLIC" },
  { icon: "User", name: "specific friends" , value : "PRIVATE"},
];

const postTypeConstants : { PUBLIC : string ,  PRIVATE : string} = {
  'PUBLIC' : 'Public',
  'PRIVATE' : 'Specific friends' 
}

export interface OptionDropDownInterFace {
  postObjInitial :postObjInterface;
}

const OptionDropDown: FC<OptionDropDownInterFace> = ({postObjInitial}) => {
  //state Begin
  const [postDropDown, setPostDropDown] = useState(false);
  //state End
  
  //context begin
  const { postObj = postObjInitial , setPostObj = undefined } : CreatePostContextInterface = useContext(CreatePostContext);
  //context end

  //event handler Begin
  const handlePostTypeDropDown = (value : any) =>{
    if(setPostObj)
    {
      setPostObj((prev)=>{
        return {...prev ,'postType': value};
      });
    }
    setPostDropDown(false);
  }
  //event handler End

  return (
    <div className="setting-dropdown">
      <Dropdown isOpen={postDropDown} toggle={() => setPostDropDown(!postDropDown)} className="custom-dropdown arrow-none dropdown-sm btn--group">
        <DropdownToggle color="transparent">
          <h5> { postTypeConstants[postObj.postType] ?? "" } <DynamicFeatherIcon iconName="ChevronDown" className="iw-14" /></h5>
        </DropdownToggle>
        <DropdownMenu>
          <ul>
            {postTypeDropDown.map((data, index) => (
              <li key={index}>
                <a href={Href} onClick = { () => { handlePostTypeDropDown(data.value) } }>
                  <DynamicFeatherIcon iconName={data.icon} className="icon-font-light iw-16 ih-16"/>
                  {data.name}
                </a>
              </li>
            ))}
          </ul>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default OptionDropDown;
