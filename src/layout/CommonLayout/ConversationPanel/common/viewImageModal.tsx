// Mtak Begin
import React from 'react';
import {  Modal, ModalHeader, ModalBody } from 'reactstrap';
interface viewImageModalInterface {
  setModal : React.Dispatch<React.SetStateAction<boolean>>;
  modal : boolean,
  image_src : string
}
function ViewImageModal(props :viewImageModalInterface ) {
  const {modal, setModal,image_src} = props;
  const toggle = () => setModal(!modal);

  return (
    <Modal id="ChatBoxCommonImageViewModalHtmlId" isOpen={modal} toggle={toggle} fullscreen>
      <ModalHeader toggle={toggle}></ModalHeader>
      <ModalBody>
        <div className = "image_div">
          <img className="image" src = {image_src} />
        </div>
      </ModalBody>
    </Modal>
  );
}

export default ViewImageModal;