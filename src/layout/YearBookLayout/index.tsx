"use client";
import { FC, useState } from "react";
import { YearBookLayoutProps } from "../LayoutTypes";
import CommonLayout from "@/layout/CommonLayout";
import UserProfile from "./UserProfile";
import UserProfileBox from "./UserProfileBox";
import YearBookMenu from "./YearBookMenu";
import EditCoverModal from "./EditCoverModal";

const YearBookLayout: FC<YearBookLayoutProps> = ({ children, title,loaderName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <CommonLayout mainClass="custom-padding profile-page" loaderName={loaderName}>
      <div className="page-center">
        <UserProfile toggle={toggle} />
        <UserProfileBox toggle={toggle} />
        <YearBookMenu title={title?title:""} />
        {children}
      </div>
      <EditCoverModal isOpen={isOpen} toggle={toggle} />
    </CommonLayout>
  );
};

export default YearBookLayout;
