import { FC, useState, useEffect } from "react";
import {Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import "./cyb.scss";

const PreviewTemplateModal: FC<any> = ({ showModal, toggleModal, templateInfo }) => {

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered className="tpl-preview-box">
      <ModalHeader toggle={toggleModal}>Template Preview</ModalHeader>
      <ModalBody style={{minHeight:'500px'}} className="p-0">
        <div className="p-2" style={{ position : 'absolute', height:'97%', width:'99%' }}>
          <div style={{position : 'absolute', height:'100%', width:'100%', overflowY:'clip', overflowX:'clip'}}>
            { 
              //templateInfo.id 
            }
            <iframe src={'https://dreamteam.co.in'} width='99%' height='99%' title='Template Preview'></iframe>
          </div>
        </div>
      </ModalBody>
    </Modal>
  )  
};

export default PreviewTemplateModal;