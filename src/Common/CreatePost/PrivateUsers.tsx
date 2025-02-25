// MTak Begin
import { FC,useEffect , useState , useContext} from "react";
import {ApiResponse,getTagPostUsersAPI} from "@/Common/CreatePost/client_api/api";
import Select from 'react-select';
import {CreatePostContextInterface,tagFriendsInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
//constants begin
const defaultUserImagePath : string = '/assets/default/user.png';
//constants end

export interface CreatePostHeaderInterFace {
  tagFriendsInitial? :tagFriendsInterface;
}

const TagFriends : FC<CreatePostHeaderInterFace> = ({}) => {
  //context begin
  const { setPostObj = undefined , setCreatePostLoading = undefined} : CreatePostContextInterface = useContext(CreatePostContext);
  //context end

  //useState begin
  const [privateUsers,setPrivateUsers] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  //useState end

  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean =  true;
    const loadData = async() => {
      let _data = {};
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
        setPrivateUsers(_users);
      }
    }
    if(isMounted)
    {
      loadData();
    }
    return ()=>{
      isMounted = false;
    };
  },[]);
  //useEffect End

  //event handler Begin
  const handleChange = (selected: any) => {
    setSelectedOptions(selected);
    let _userIds : number [] = []; 
    if(setPostObj)
    {
      selected.map((record:any, index:number)=>{
        _userIds.push(record.user_id);
      });
  
      setPostObj((prev)=>{
        return {...prev,privateUserIds : _userIds};
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
    <div className="privateUsersDiv">
      <h5 className="d_title">Share with specific friends:</h5>
      <Select
        isMulti
        options={privateUsers}
        value={selectedOptions}
        onChange={handleChange}
        formatOptionLabel={customOptionLabel}
        placeholder = "Share with specific friends"
      />
    </div>
  );
};
export default TagFriends;