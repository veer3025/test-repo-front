import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {Post,Comment,Friends,ImagePath,View,ViewProfile} from "../../../utils/constant";
import React,{  useState , useEffect } from "react";
import { Container, Input } from "reactstrap";
import FriendSDropDown from "./FriendSDropDown";
import CustomImage from "@/Common/CustomImage";
import Image from "next/image";
import Link from "next/link";
import { getFriendsData } from "@/libs/friends";


const FriendListBox: React.FC = () => {
  
  const [friends, setFriends] = useState<any[]>([]);   
  const [isLoading,setIsLoading] = useState(true);
  let user_id = 9017;
  let yearbook_id = 25;

  const fetchData = async () => {  
    let data = await getFriendsData(user_id, yearbook_id);   
    
    if (data) {   
      setFriends(data);  
    }
  };
  
    useEffect(()=>{
      let isMounted = true;
      
      async function loadData() {        
        setIsLoading(true);
        try 
        {
          await Promise.all([fetchData()]);          
        } 
        catch (error) {
          console.error("Error fetching data:", error);
          if (isMounted) setFriends([]);
        } 
        finally 
        {
          if (isMounted) setIsLoading(false);
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
    
  return (
    <div className="friend-list-box section-b-space">
      <div className="card-title">
        <h3>{Friends}</h3>
        <div className="right-setting">
          <div className="search-input input-style icon-right">
            <DynamicFeatherIcon
              iconName="Search"
              className="icon-dark icon iw-16"
            />
            <Input type="text" placeholder="find friends..." />
          </div>
          <FriendSDropDown />
        </div>
      </div>
      <Container fluid>
        <div className="friend-list friend-page-list">
          <ul>
            {friends.map((data,index) => (
              <li key={index}>
                <div className="profile-box friend-box">
                  <div className="profile-content">
                    <div className="image-section">
                      <div className="profile-img">
                        <div className="bg-size blur-up lazyloaded">
                          <CustomImage src={`${ImagePath}/user-sm/1.jpg`} className="img-fluid blur-up lazyload bg-img" alt="profile"/>
                        </div>
                        <span className="stats">
                          <Image src={`${ImagePath}/icon/verified.png`} width={15} height={15} className="img-fluid blur-up lazyloaded" alt="verified"/>
                        </span>
                      </div>
                    </div>
                    <div className="profile-detail">
                      <h2> {data.first_name} <span>❤</span></h2>
                      <h5>{data.email}</h5>
                      <div className="counter-stats">
                        <ul>
                          <li><h3 className="counter-value">546</h3><h5>{Post}</h5></li>
                          <li><h3 className="counter-value">26335</h3><h5>{Comment}</h5></li>
                          <li><h3 className="counter-value">6845</h3><h5>{View}</h5></li>
                        </ul>
                      </div>
                      <Link href="/profile/friend" className="btn btn-outline">{ViewProfile}</Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default FriendListBox;
