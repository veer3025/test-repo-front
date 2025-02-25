import { FC } from "react";
import {Modal, ModalBody, ModalHeader, Table} from "reactstrap";
import "./cyb.scss";

const uty_cap:any = { 'S' : 'Student', 'C' : 'Co-Ordinator', 'X' : '' };
const gen_cap:any = { 'M' :  'Male', 'F' : 'Female', 'O' : 'Other', 'X' : ''};

const UserListModal: FC<any> = ({ showModal, toggleModal, userList }) => {

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered className="yb-user-list-box">
      <ModalHeader toggle={toggleModal}>Year Book Users</ModalHeader>
      <ModalBody style={{height:'500px'}} className="p-0">
        <div className="cyb-schoollbar w-100" style={{height:'98%', overflowY:'auto', overflowX:'clip'}}>
          <Table striped>
            <thead>
              <tr>
                <th style={{width:'05%'}}>S.No.</th>
                <th style={{width:'17%'}}>User Name</th>
                <th style={{width:'10%'}}>User Type</th>
                <th>Email</th>
                <th style={{width:'09%'}}>Mobile No.</th>
                <th style={{width:'11%'}}>WhatsApp No.</th>
                <th style={{width:'07%'}}>Gender</th>
              </tr>
            </thead>
            <tbody>
              {
                userList.map((usr:any, idx:any) => (
                  <tr>
                    <th scope="row">{ idx+1 }</th>
                    <td>{usr?.u_nm??''}</td>
                    <td>
                      {
                        uty_cap[usr?.user_type?.trim()?.toUpperCase()??'X']??'' 
                      }
                    </td>
                    <td>{usr?.email??''}</td>
                    <td>{usr?.phone_number??''}</td>
                    <td>{usr?.whatsup_number??''}</td>
                    <td>
                      {
                        gen_cap[usr?.gender?.trim()?.toUpperCase()??'X']??''
                      }
                    </td>
                  </tr>
                ))  
              }
            </tbody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  )  
};

export default UserListModal;