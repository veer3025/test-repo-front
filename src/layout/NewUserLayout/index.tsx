"use client";
import NewUserLayoutHeader from "./NewUserLayoutHeader";
import { Container } from "reactstrap";
import { NewUserLayoutProps } from "../LayoutTypes";

import { useState } from "react";
import { skeltonLoaderList } from "@/Data/Layout";


const NewUserLayout: React.FC<NewUserLayoutProps> = ({differentLogo,loaderName="defaultLoader",children,mainClass,headerClassName}) => {
  const [loaderShowKey, setLoaderShowKey] = useState("defaultLoader")
  return (
    <>
      {skeltonLoaderList[loaderName]}
      <NewUserLayoutHeader headerClassName={headerClassName ? headerClassName : ""} differentLogo={differentLogo}/>
      <Container fluid className={`page-body  ${mainClass ? mainClass : ""}`}>
        {children}
      </Container>
    </>
  );
};

export default NewUserLayout;

