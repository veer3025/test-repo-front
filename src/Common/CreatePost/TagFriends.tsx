// MTak Begin
import { FC,useEffect , useState , useContext} from "react";
import {ApiResponse,getTagPostUsersAPI} from "@/Common/CreatePost/client_api/api";
import Select from 'react-select';
import {CreatePostContextInterface,tagFriendsInterface,postObjInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
//constants begin
const defaultUserImagePath : string = '/assets/default/user.png';
//constants end

export interface CreatePostHeaderInterFace {
  postObjInitial? :postObjInterface;
}

const TagFriends : FC<CreatePostHeaderInterFace> = ({postObjInitial}) => {
  //context begin
  const { setTagFriendsObj = undefined,setCreatePostLoading = undefined , postObj = postObjInitial} : CreatePostContextInterface = useContext(CreatePostContext);
  //context end

  //useState begin
  const [tagUsers,setTagUsers] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  //useState end

  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean =  true;
    const loadData = async() => {
      let _data = {};
      if(postObj?.postType == "PRIVATE")
      {
        _data = {..._data,'postType':postObj?.postType,'userIds':postObj?.privateUserIds}
      }
      let _users : any[] = [];
      try{
        setCreatePostLoading && setCreatePostLoading(true);
        let response : ApiResponse  = await getTagPostUsersAPI(_data) as ApiResponse;
        if(response?.status ==  200)
        {
          _users = response?.data?.users ?? [];
        }
      }
      catch(error:any){

      }
      finally{
        setCreatePostLoading && setCreatePostLoading(false);
        setTagUsers(_users);
        setSelectedOptions([]);
      }
    }
    if(isMounted)
    {
      loadData();
    }
    return ()=>{
      isMounted = false;
    };
  },[postObj?.privateUserIds , postObj?.postType]);
  //useEffect End

  //event handler Begin
  const handleChange = (selected: any) => {
    setSelectedOptions(selected);
    let _userIds : number [] = []; 
    if(setTagFriendsObj)
    {
      selected.map((record:any, index:number)=>{
        console.log(record);
        _userIds.push(record.user_id);
      });
  
      setTagFriendsObj((prev)=>{
        return {...prev,userIds : _userIds};
      });
    }
  };

  const customOptionLabel = (e: any) => (
    <div className="d-flex align-items-center">
      <img
        src={ `${Boolean(e.profile_photo) ? `${e.profile_photo}` : `${defaultUserImagePath}` }` } 
        alt={e.full_name}
        style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 10 }}
      />
      <div className="d-flex flex-column" title = {e.email}>
        <span>{e.full_name}</span>
      </div>
    </div>
  );
  //event handler end
  
  return (
    <div className="tagFriendDiv">
      <h5 className="d_title">Tag Friends:</h5>
      <Select
        isMulti
        options={tagUsers}
        value={selectedOptions}
        onChange={handleChange}
        formatOptionLabel={customOptionLabel}
        placeholder = "Tag Friends"
      />
    </div>
  );
};
export default TagFriends;