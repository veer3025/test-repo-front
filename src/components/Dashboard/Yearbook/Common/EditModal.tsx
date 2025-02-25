"use-client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC , useEffect, useState,useRef } from "react";
import {Button,Input,Modal,ModalBody,ModalFooter,ModalHeader} from "reactstrap";
import { Save,Close, Message,Href } from "../../../../utils/constant";
import { ShareModalProps } from "@/Common/CommonInterFace";
import Picker, {  EmojiClickData } from 'emoji-picker-react';

interface TestimonialData {
  setData?: React.Dispatch<React.SetStateAction<any[]>>;  
  Mode:string;
  data: {
    message: string;
    testimonial_user_name: string;    
    no_of_char_testimonial:number;
  };
  onSave: (updatedData: { message: string  }) => void;
}
const EditModal: FC<ShareModalProps & TestimonialData> = ({ setData,showModal, toggleModal , data, onSave }) => {

    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(data?.message || "");    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null); // Reference for the picker
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    
    useEffect(() => {
      setMessage(data?.message||"")      
    }, [showModal]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          pickerRef.current &&
          !pickerRef.current.contains(event.target as Node)      &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setShowEmojiPicker(false);
        }
      };
  
      if (showEmojiPicker) {
        document.addEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showEmojiPicker]);
  

    
    const toggleEmojiPicker = () => {      
      setShowEmojiPicker(!showEmojiPicker);
    };

    const handleChange = (value: string) => {
      if (value.length <= data?.no_of_char_testimonial) {
        setMessage(value);
      }
      console.log(message);
    };
    
    // Update addEmoji to call handleChange
    const addEmoji = (emoji: EmojiClickData) => {
      handleChange(message + emoji.emoji);
    };

    const validateForm = () => {
      
      let errors : any = {};
     
      if (message?.trim() == '') {
        
        errors.message = 'Testimonial is required...!!';
        setErrors(errors);
        document?.getElementById('message')?.focus();
        return false;
      } 
  
      setErrors(errors);
      setIsFormValid(Object.keys(errors).length === 0);
    };

    const handleSave = async() => {
      setIsSaving(true);
      validateForm()      
      onSave({ message });
    };
    
  
  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered modalClassName="mobile-full-width modal-lg top-modal" contentClassName="share-modal lg">
      <ModalHeader toggle={toggleModal}>
        <h2>Write Testimonial To {data?.testimonial_user_name}</h2>
      </ModalHeader>
      <ModalBody>                
      <div className="position-relative">
          {/* Textarea */}
          <Input
            type="textarea"
            rows="5"
            value={message}
            className="form-control"
            placeholder="Write a message..."
            onChange={(e) => handleChange(e.target.value)}

          />

          {/* Emoji Button (Top-Right Inside Textarea) */}
          <button
            type="button"
            ref={buttonRef}
            onClick={toggleEmojiPicker}
            className="position-absolute top-0 end-0 mt-1 me-0 bg-white p-1 rounded-circle  border"
          >
            <DynamicFeatherIcon iconName="Smile" className="text-secondary fs-5" />
          </button>

          {/* Emoji Picker (Bottom-Right Below Textarea) */}
          {showEmojiPicker && (
            <div ref={pickerRef} className="position-absolute end-0   rounded p-2 z-3" style={{marginTop:"190px",marginRight:'-31px'}}>
              <Picker onEmojiClick={addEmoji} />
            </div>
          )}
        </div>

        {/* Character count */}
        <small className="text-muted">
          {data?.no_of_char_testimonial - message.length} characters remaining
        </small>
      </ModalBody>
      <ModalFooter>
        <Button className="bg-danger border-danger" color="solid" onClick={toggleModal}>{Close}</Button>
        <Button color='solid' onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." :'Save'}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
