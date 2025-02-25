import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC, useState ,useEffect } from "react";
import { Dropdown, Media, DropdownToggle, DropdownMenu } from "reactstrap";
import { Href, ImagePath } from "@/utils/constant/index";
import { postDropDownOption } from "@/Data/NewsFeed";
import HoverMessage from "@/Common/CreatePost/postPanel/HoverMessage";
import TaggedUserDropDown from "@/Common/CreatePost/postPanel/TaggedUserDropDown"
import { ApiResponse , getUsersPostTaggedWithAPI} from "@/Common/CreatePost/client_api/api";
import { Spinner } from "reactstrap";
//interface begin
export interface CommonUserHeadingProps {
  image: string;
  id:string;
  post:any;
}
//inteface end
const CommonUserHeading: FC<CommonUserHeadingProps> = ({ image,id,post }) => {
  //state begin
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [showOption, setShowOption] = useState<boolean>(false);
  const [taggedUsersData,setTaggedUsersData] = useState<any[]>([]);
  const [drpdwnTaggedUsrOpen,setDrpdwnTaggedUsrOpen] = useState<boolean>(false);
  //state end  
  //event handler begin
  const loadData = async ()=>{
    let _usersData : any[] = [];
    let _data : {postId : number} = { postId : post?.id };
    try{
      setIsLoading(true);
      let response : ApiResponse =  await getUsersPostTaggedWithAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        _usersData = response?.data?.usersData ?? [];
      }
    }
    catch(error)
    {

    }
    finally{
      setIsLoading(false);
    }
    // console.log(user_full_name);
    setTaggedUsersData(_usersData);
  }
  //event handler end

  //useEffect begin
  useEffect(()=>{
    let isMounted : boolean = true;
    if(isMounted)
    {
      loadData();
    }

    return ()=>{
      isMounted = false;
    }
  },[]);
  //useEffect end

  //localConstant
  const taggedUsersDataLength:number = taggedUsersData?.length ?? 0;
  return (
    <div className="post-title justify-content-between">
      <div className="profile">
        <Media>
          <a className="popover-cls user-img bg-size blur-up lazyloaded" href={Href} id={id}>
            <img src={image} className="img-fluid user-img" alt="user"/>
          </a>
          <Media body>
            <div className="d-flex gap-1 align-items-center mb-1 main_head">
              <h5 className="m-0 user_name" title = {post.post_by_user_name}>{post.post_by_user_name}</h5>
              {
                (!isLoading) 
                ?
                <>
                  {
                    Boolean(taggedUsersDataLength) &&
                    <div className="text-secondary taggedDiv">
                      <span className="">is with</span> 
                      <span className="ms-1 d-inline-block fw-bold first_user">
                        {taggedUsersData[0].user_full_name} 
                      </span>
                      {
                        taggedUsersDataLength >= 2 &&
                        <TaggedUserDropDown 
                          drpdwnTaggedUsrOpen = {drpdwnTaggedUsrOpen}
                          setDrpdwnTaggedUsrOpen = {setDrpdwnTaggedUsrOpen}
                          taggedUsersData = {taggedUsersData}
                        />
                      }
                    </div>
                  }
                </>
                :
                <Spinner color="primary" size="sm" type="grow"></Spinner>
              }
            </div>
            <h6>{post.created_text}</h6>
          </Media>
        </Media>
        <HoverMessage placement={"right"} target={id} image = {image} user_name = {post.post_by_user_name} email = {post.post_by_email} country_name = { post.country_name} />
      </div>

      { post?.type == "PRIVATE" && <span className="fw-bold text-primary">{post?.type}</span> }
      {/* Start Here */}
      {/* <div className="setting-btn ms-auto setting-dropdown no-bg">
        <Dropdown isOpen={showOption} toggle={() => setShowOption(!showOption)} className="custom-dropdown arrow-none dropdown-sm btn-group">
          <DropdownToggle color="transparent">
            <div>
              <DynamicFeatherIcon iconName="MoreHorizontal" className="icon icon-font-color iw-14"/>
            </div>
          </DropdownToggle>
          <DropdownMenu>
            <ul>
              {postDropDownOption.map((data, index) => (
                <li key={index}>
                  <a href={Href}>
                    <DynamicFeatherIcon iconName={data.iconName} className="icon icon-font-color iw-14"/>
                    {data.post}
                  </a>
                </li>
              ))}
            </ul>
          </DropdownMenu>
        </Dropdown>
      </div> */}
    </div>
  );
};

export default CommonUserHeading;
