"use client";
import EducationProfile from "@/components/profile/EducationProfile";
import HobbiesProfile from "@/components/profile/HobbiesProfile";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileFriendList from "@/components/profile/ProfileFriendList";
import YearBookLayout from "@/layout/YearBookLayout";
import { Col, Container, Row } from "reactstrap";


const AboutProfile = () => {
  return (
    <YearBookLayout title="about" loaderName="aboutProfileSkelton" >
      <Container fluid className="section-t-space px-0">
        <Row>
          <Col xs="4" className="content-left  res-full-width order-1">
            <ProfileAbout/>  
          </Col>
          <Col xs="8" className="content-center res-full-width">
            <HobbiesProfile />
            <EducationProfile />
            <ProfileFriendList />
          </Col>
        </Row>
      </Container>
    </YearBookLayout>
  );
};

export default AboutProfile;
