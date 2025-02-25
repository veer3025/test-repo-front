"use client";
import { Container } from "reactstrap";
import LeftHeader from "@/layout/CommonLayout/CommonLayoutHeader/LeftHeader";
import RightHeader from "./RightHeader";
import { NewUserLayoutHeaderInterFace } from "@/layout/LayoutTypes";

const NewUserLayoutHeader: React.FC<NewUserLayoutHeaderInterFace> = ({headerClassName,differentLogo}) => {
  return (
    <header className={headerClassName?headerClassName :""}>
      <div className="mobile-fix-menu"></div>
      <Container fluid={true} className="custom-padding">
        <div className="header-section">
          <LeftHeader differentLogo={differentLogo} />
          <RightHeader />
        </div>
      </Container>
    </header>
  );
};

export default NewUserLayoutHeader;
