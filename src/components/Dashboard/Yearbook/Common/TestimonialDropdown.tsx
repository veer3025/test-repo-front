import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Href } from "../../../../utils/constant";
import React, { FC, useEffect, useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import { toast } from 'react-toastify'
import EditModal from "./EditModal";
import { saveTestimonial } from "@/libs/testimonial/getTestimonial";
import Swal from 'sweetalert2';

interface Testimonial {
  id: number;
  yearbook_id: number;
  testimonial_to: number;
  testimonial_from: number;
  message: string;
  first_name:string;
  testimonial_to_name:string;
  is_active:string;
  user_id:number;
  is_testimonial_written_for_me:number;
  request_from:number;
  request_to:number;
  request_from_name:string;
  can_receive_testimonials:string;
  req_sent:number;
  post_id:number;  
}

interface TestimonialDropdownProps extends Testimonial{
  setData?: React.Dispatch<React.SetStateAction<any[]>>;  
  activeTab:number;  
  testimonial_data?: Testimonial[]; 
  LoginUserId:any,
  LoginUserData:any
}
const TestimonialDropdown: FC<TestimonialDropdownProps> = ({ setData,  activeTab, id, user_id,yearbook_id,testimonial_to,testimonial_from ,message,first_name,testimonial_to_name,is_active,is_testimonial_written_for_me,request_from,request_to,request_from_name,can_receive_testimonials,req_sent,post_id,LoginUserId,LoginUserData}) => {
  
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);  
  const [reload, setReload] = useState(false)  
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<"C" | "E">("C");
   
  const openModal = (mode: "C" | "E") => {
    setModalMode(mode);
    toggleModal();
  };
  
  const handleSave = async(updatedData: any) => {
    if (isSaving) return; // Prevent duplicate clicks
    setIsSaving(true);
  
      try {  
          setReload(true);
          
          const data: { message: string,testimonial_to:number,mode:string ,user_id:number} = { message: updatedData.message ,testimonial_to: (activeTab===3)?testimonial_to:(activeTab===2)?user_id:request_from,mode:modalMode,user_id:LoginUserId};
          
          const response = await saveTestimonial(data);      
          console.log(response);
          if (response.status) {     
              setData?.([])    
              toggleModal()              
              toast.success(response.message, {
                position: 'top-right',
                hideProgressBar: false
              })                 
          } else {          
            toast.error(response.message, {
              position: 'top-right'
            })      
          }
         } catch (error) {      
           toast.error('Unable to add Record!', {
             position: 'top-right'
           })
         }    
         finally
         {
          setReload(false);       
          setIsSaving(false); // Reset saving state
        }       
  };

  const handleDelete = async () => {  

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete testimonial!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "No, Cancel it!",
      }).then(async (result) => {
          if (result.isConfirmed) { 
                     
              try {       
                Swal.fire({
                  title: "Deleting...",
                  text: "Please wait while we process your request.",
                  allowOutsideClick: false, 
                  didOpen: () => {
                    Swal.showLoading();  // Show loading spinner
                  }
                });               
                setReload(true);
                
                const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},  
                body: JSON.stringify({testimonial_id :id,testimonial_from:testimonial_from,testimonial_to:testimonial_to,yearbook_id:yearbook_id}) }
              
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/delete`, opt)
                const result = await response.json(); 
                
                if (result.status) {  
                  setData?.([])  
                  Swal.fire({
                    title: "Deleted!",
                    text: result.message,
                    icon: "success",
                    timer: 2000, 
                    showConfirmButton: false
                  });                  
                                     
                } else {          
                    Swal.fire("Error!", result.message, "error");                    
                }
              } catch (error:any) {      
                Swal.fire("Error!", error.message || "Something went wrong", "error");                 
              }    
              finally
              {
                setDropDownOpen(false);      
                setReload(false);
              }   
        }
    });
  }
    
  const handleToggleActive = async () => {
    
    Swal.fire({
      title: "Are you sure?",
      text: `You want to ${is_active=='Y' ? "Inactive" : "Active"} testimonial!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: `Yes, ${is_active=='Y' ? "Inactive" : "Active"} it!`,
      cancelButtonText: "No, Cancel it!",
      }).then(async (result) => {
          if (result.isConfirmed) { 
                     
            try {         

              Swal.fire({
                title: is_active ? "Deactivating..." : "Activating...",
                text: "Please wait while we process your request.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); 
                },
              });

              setReload(true);        
              
              const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},  
              body: JSON.stringify({testimonial_id : id,active_inactive:is_active}) }
            
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/active_inactive`, opt)
              const result = await response.json(); 
              
              if (result.status) {   
                setData?.([]);
                Swal.fire({
                  title: result.message,                  
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                });
      
              } else {          
                Swal.fire("Error!", result.message, "error");
              }
            } catch (error:any) {      
              Swal.fire("Error!", error.message || "Something went wrong", "error");
            }    
            finally
            {
              setDropDownOpen(false);    
              setReload(false);
            }   
        }
    });   
  }

  const handleSendRequest = async () => {  
    
    Swal.fire({
      title: "Are you sure?",
      text: "You want to send testimonial request!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, Send it!",
      cancelButtonText: "No, Cancel it!",
      }).then(async (result) => {
          if (result.isConfirmed) { 
                     
            try {     
              
              Swal.fire({
                title: "Sending request...",
                text: "Please wait while we process your request.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); // Show loading spinner
                },
              });

              
              setReload(true);
                           
              const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},  
              body: JSON.stringify({request_to: (activeTab===3)?testimonial_to:user_id,request_from:LoginUserId}) }
            
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/send_request`, opt)
              const result = await response.json(); 
              
              if (result.status) {                   
                setData?.([]) 
                Swal.fire({                  
                  title: result.message,                  
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                });                   
              } else {          
                Swal.fire("Error!", result.message, "error");
              }
            } catch (error:any) {      
              Swal.fire("Error!", error.message || "Something went wrong", "error");
            }    
            finally
            {
              setDropDownOpen(false);      
              setReload(false);
            }  
        }
    });
 
  }
  
  const handleRejectRequest = async () => {  
    
    Swal.fire({
      title: "Are you sure?",
      text: "You want to reject testimonial request!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, Reject it!",
      cancelButtonText: "No, Cancel it!",
      }).then(async (result) => {
          if (result.isConfirmed) { 
                     
            try {          

              Swal.fire({
                title: "Rejecting request...",
                text: "Please wait while we process your request.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); // Show loading spinner
                },
              });

              setReload(true);
              
              const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},  
              body: JSON.stringify({request_from: request_from,request_to:request_to,yearbook_id:yearbook_id}) }
            
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/reject_request`, opt)      
              const result = await response.json(); 
              
              if (result.status) {                     
                setData?.([])     
                Swal.fire({
                  title: result.message,                  
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                });               
              } else {          
                Swal.fire("Error!", result.message, "error");
              }
            } catch (error:any) {      
              Swal.fire("Error!", error.message || "Something went wrong", "error"); 
            }    
            finally
            {
              setDropDownOpen(false);      
              setReload(false);
            }   
        }
    }); 
  }
  return (
    <div className="setting-btn ms-auto setting-dropdown no-bg">      
      <Dropdown className="btn-group custom-dropdown arrow-none dropdown-sm" isOpen={dropDownOpen} toggle={() => setDropDownOpen(!dropDownOpen)}>
        <DropdownToggle color="transparent">
          <div>
            <DynamicFeatherIcon iconName="MoreHorizontal" className="icon icon-font-color iw-14"/>
          </div>
        </DropdownToggle>        
        <DropdownMenu>
          <ul>
            {activeTab === 1 && (
              <>
                { LoginUserData.can_delete_testimonial === 'Y' ? (
                <li>
                  <a href={Href} onClick={handleDelete}>
                    <DynamicFeatherIcon iconName="Delete" className="icon-font-light iw-16 ih-16"/>
                    Delete
                  </a>
                </li>   
                ):null}  
                <li>
                  <a href={Href} onClick={handleToggleActive}>
                  <DynamicFeatherIcon iconName={is_active === 'Y' ? 'ToggleRight' : 'ToggleLeft'} className="icon-font-light iw-16 ih-16"/>
                  {is_active === 'Y' ? 'Inactive' : 'Active'}                
                  </a>
                </li>
              </>
            )}
            {activeTab === 2 && (
              <>              
              { can_receive_testimonials ? (
                <>
                {LoginUserData.show_write_link_in_write_request_tab==='Y' ? (                
                <li>
                  <a href={Href} onClick={() => openModal("C")}>
                    <DynamicFeatherIcon iconName="Edit3" className="icon-font-light iw-16 ih-16"/>
                    Write
                  </a>
                </li>   
                ):null } 
                {LoginUserData.can_receive_testimonials && !req_sent ? (
                <li>
                  <a href={Href} onClick={handleSendRequest}>
                    <DynamicFeatherIcon iconName="ArrowUpRight" className="icon-font-light iw-16 ih-16"/>
                    Request
                  </a>
                </li> 
                ) : null}                
                </>
               ):null}
              </>
            )}     
             {activeTab === 3 && (
              <>              
               <li>
                  <a href={Href} onClick={() =>{
                                                if (post_id === null) {
                                                  openModal("E");
                                                } else {
                                                  toast.error("You Cannot Edit this as You have already shared it as Testimonial.. Remove Post to Edit this..", {
                                                    position: 'top-right',
                                                    hideProgressBar: false
                                                  })  
                                                } 
                                              }}>
                  <DynamicFeatherIcon iconName="Edit" className="icon-font-light iw-16 ih-16"/>
                  Edit
                  </a>
                </li>                
                { can_receive_testimonials &&  !is_testimonial_written_for_me ? (
                  <li>
                  <a href={Href} onClick={handleSendRequest}>
                    <DynamicFeatherIcon iconName="ArrowUpRight" className="icon-font-light iw-16 ih-16"/>
                    Request
                  </a>
                </li> 
                ):null}                 
                { LoginUserData.can_delete_testimonial ==='Y' ? (
                <li>
                  <a href={Href} onClick={handleDelete}>
                    <DynamicFeatherIcon iconName="Delete" className="icon-font-light iw-16 ih-16"/>
                    Delete
                  </a>
                </li>  
                ):null}
              </>
            )}     
             {activeTab === 4 && (
              <>
                { can_receive_testimonials ? (
                <li>
                  <a href={Href} onClick={toggleModal}>
                    <DynamicFeatherIcon iconName="Edit3" className="icon-font-light iw-16 ih-16"/>
                    Write
                  </a>
                </li>     
              ):null}
              { LoginUserData.can_delete_testimonial ==='Y' ? (
                <li>
                  <a href={Href} onClick={handleRejectRequest}>
                    <DynamicFeatherIcon iconName="XSquare" className="icon-font-light iw-16 ih-16"/>
                    Reject Request
                  </a>                
                </li> 
                ):null} 
              </>
            )}     
          </ul>
        </DropdownMenu>
      </Dropdown>     
      {showModal  && modalMode && (
      <EditModal showModal={showModal} 
                toggleModal={toggleModal}  
                Mode={modalMode}
                setData={setData}
                data={{
                    message: message,                    
                    testimonial_user_name: (activeTab===2) ? first_name :(activeTab===3)?testimonial_to_name : request_from_name,                    
                    no_of_char_testimonial: LoginUserData.no_of_char_testimonial,
                }}  
                onSave={handleSave}
        />
      )}
    </div>
  );
};
export default TestimonialDropdown;
