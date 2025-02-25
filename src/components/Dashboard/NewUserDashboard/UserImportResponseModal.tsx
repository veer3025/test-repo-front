import { FC } from "react";
import {Modal, ModalBody, ModalHeader, Row, Table} from "reactstrap";
import "./cyb.scss";

const hdr_cap:any = { 'I' : 'Year Book Users Imported', 'E' : 'Year Book Users Already Exist', 'F' : 'User Records Failed' };
const hdr_cls:any = { 'I' : 'text-primary', 'E' : 'text-warning', 'F' : 'text-danger'}
const gen_cap:any = { 'M' :  'Male', 'F' : 'Female', 'O' : 'Other', 'X' : ''};

const UserImportResponseModal: FC<any> = ({ showModal, toggleModal, importResponse }) => {

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered className="yb-user-list-box">
      <ModalHeader toggle={toggleModal}>
        <div className={hdr_cls[importResponse?.list_type??0]??'text-primary'}>
          {hdr_cap[importResponse?.list_type??0]??'User List'}
        </div>
      </ModalHeader>
      <ModalBody style={{height:'500px'}} className="p-0">
        <div className="cyb-schoollbar w-100" style={{height:'98%', overflowY:'auto', overflowX:'clip'}}>
          <Table striped>
            <thead>
              <tr>
                <th style={{width:'05%'}}>S.No.</th>
                <th style={{width:'17%'}}>User Name</th>
                <th>Email Id</th>
                <th style={{width:'10%'}}>Mobile No.</th>
                <th style={{width:'11%'}}>WhatsApp No.</th>
                <th style={{width:'07%'}}>Gender</th>
                {
                  importResponse?.list_type == 'F' 
                  ?
                  <th>Fail Reason</th> 
                  : null
                }
              </tr>
            </thead>
            <tbody>
              {
                importResponse?.user_list?.map((usr:any, idx:any) => (
                  <tr>
                    <th scope="row">{ idx+1 }</th>
                    <td>{usr?.u_nm??''}</td>
                    <td>{usr?.u_em??''}</td>
                    <td>{usr?.u_mb??''}</td>
                    <td>{usr?.u_wn??''}</td>
                    <td>
                      {
                        gen_cap[usr?.u_gn?.trim()?.toUpperCase()??'X']??''
                      }
                    </td>
                    {
                      importResponse?.list_type == 'F' 
                      ?
                      <td>{usr?.fail_reason??''}</td> 
                      : null
                    }
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

export default UserImportResponseModal;