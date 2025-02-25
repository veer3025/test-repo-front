// Mtak Begin
import React from 'react';
import {  Modal, ModalHeader, ModalBody } from 'reactstrap';
import {viewImageModalDataInterface} from "@/Common/CreatePost/types/postPanel"
interface ViewImageModalInterface {
  setModalData : React.Dispatch<React.SetStateAction<viewImageModalDataInterface>>;
  modalData : viewImageModalDataInterface,
}
function ViewImageModal(props :ViewImageModalInterface ) {
  const {modalData, setModalData} = props;
  const close = () => { 
    setModalData((prev)=>{
      return {image:"",open:false}
    });
  }
  const image_src = "";
  return (
    <Modal id="ChatBoxCommonImageViewModalHtmlId" isOpen={modalData.open} toggle={close} fullscreen>
      <ModalHeader toggle={close}></ModalHeader>
      <ModalBody>
        <div className = "image_div">
          <img className="image" src = {modalData.image} />
        </div>
      </ModalBody>
    </Modal>
  );
}

export default ViewImageModal;