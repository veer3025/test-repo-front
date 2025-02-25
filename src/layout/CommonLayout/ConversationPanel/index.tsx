// MTak Begin
import { useEffect ,useState ,FC } from "react";
import PanelHeader from "./PanelHeader";
import SearchBar from "./SearchBar";
import CloseFriends from "./CloseFriends";
// import RecentChats from "./RecentChats";
// import { closeFriendsData, recentChatsData } from "@/Data/Layout";
import { ConversationPanelInterFace } from "@/layout/LayoutTypes";
//My Imports
import { getChatUsersAPI ,ApiResponse} from "@/layout/client_api/chat_box_common/api";
//My Interface
//constants begin
const chatUsersInterval = 10000;
//constants end
const ConversationPanel: FC<ConversationPanelInterFace> = ({sidebarClassName}) => {
  //state Begin
  const [isInitialChatUsersLoaded,setIsInitialChatUsersLoaded] =  useState<boolean>(false);
  const [chatUsersOrig, setChatUsersOrig] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [searchFriendText,setSearchFriendText] = useState<string>("");
  const [debounceSearchTimeout,setDebounceSearchTimeout] =  useState<any>(null);
  //state End
  
  //Event handler Begin
  const handleFilterChatUsers = (value : string) =>{
    // const value : string =  event.target.value;
    setSearchFriendText(value);
    if(debounceSearchTimeout)
    {
      clearTimeout(debounceSearchTimeout);
    }

    const newTimeout : any = setTimeout(()=>{
      setChatUsers((prev)=>{
        if( !Boolean(value) )
        {
          return chatUsersOrig;
        }
        else
        {
          return chatUsersOrig.filter((record:any,index,number)=>{
            return record.full_name.toLowerCase().includes(value.trim().toLowerCase());
          });
        }
      });  
    },600);
    setDebounceSearchTimeout(newTimeout);
  }
  //Event handler End

  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean = true;
    const loadData =  async() => {
      let _chatUsers : any[] = [];
      let body : object = { };
      try{
        let response = await getChatUsersAPI(JSON.stringify(body)) as ApiResponse;
        if(response.status ==  200)
        {
          _chatUsers = response?.data?.users ?? [];
        }
      }
      catch(error)
      {
      }
      finally{
        setChatUsers(()=>{
          return _chatUsers;
        });
        setChatUsersOrig(()=>{
          return _chatUsers;
        });
        setIsInitialChatUsersLoaded(true);
      }
    }
    if(isMounted)
    {
      loadData();
    }
  },[isInitialChatUsersLoaded == true]);

  useEffect(()=>{
    let isMounted : boolean = true;
    let intervalId : ReturnType<typeof setInterval> | undefined = undefined;
    const loadData = async () =>{
      try{
        let body : object = { };
        let response = await getChatUsersAPI(JSON.stringify(body)) as ApiResponse;
        if(response.status ==  200)
        {
          let _chatUsers = response?.data?.users ?? [];
          setChatUsersOrig(_chatUsers);
        }

      }
      catch(error:any){
      }
      finally{
      }
    }

    if(isMounted)
    {
      intervalId = setInterval(()=>{
        loadData();
      },chatUsersInterval);
    }

    return ()=>{
      clearInterval(intervalId);
      isMounted = false;
    }
  },[])

  // useEffect(()=>{
  //   let isMounted : boolean = true;
  //   let intervalId : ReturnType<typeof setInterval> | undefined = undefined;
  //   const loadData = async () =>{
  //     try{
  //       let data = {};
  //       let response : ApiResponse = await getChatUsersActivity(data) as ApiResponse;
  //       if(response.status == 200)
  //       {
  //         let activityRecords = response?.data?.activityRecords ?? [];  
  //         setChatUsersOrig((prev)=>{
  //           let _chatUsers : any[] = prev.map((record_1:any,index:number)=>{
  //             let activityRecord : any = null;
  //             for(let record_2 of activityRecords)
  //             {
  //               if(record_2.user_id == record_1.user_id)
  //               {
  //                 activityRecord = record_2;
  //                 break;
  //               }
  //             }
  //             record_1.unseen_chat_count = activityRecord?.unseen_chat_count;
  //             record_1.last_seen_object = activityRecord?.last_seen_object;
  //             return record_1;
  //           });    
  //           return _chatUsers;
  //         });
  //       }
  //     }
  //     catch(error:any){
  //     }
  //     finally{
  //     }
  //   }

  //   if(isMounted)
  //   {
  //     intervalId = setInterval(()=>{
  //       loadData();
  //     },chatUsersInterval);
  //   }

  //   return ()=>{
  //     clearInterval(intervalId);
  //     isMounted = false;
  //   }
  // },[])

  useEffect(()=>{ 
    let isMounted = true;
    if(isMounted && Boolean(chatUsersOrig?.length))
    {
      handleFilterChatUsers(searchFriendText);
    }
    return ()=>{
      isMounted =  false;
    }
  },[chatUsersOrig])

  //useEffect Ends

  return (
    <div className={`conversation-panel ${sidebarClassName?sidebarClassName:"xl-light"}`}>
      <PanelHeader />
      <SearchBar handleFilterChatUsers = {handleFilterChatUsers} searchFriendText = {searchFriendText} setSearchFriendText ={setSearchFriendText}/>
      <CloseFriends chatUsers = {chatUsers}/>
    </div>
  );
};

export default ConversationPanel;
