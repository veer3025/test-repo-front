"use client";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import ActivityFeed from "@/components/profile/ActivityFeed";
import YearBookLayout from "@/layout/YearBookLayout";
import { Col, Container, Row } from "reactstrap";

const ProfileTimeLine = () => {
  return (
    <YearBookLayout title="acitivity feed" loaderName="activityFeedProfile">
      <Container fluid className="section-t-space px-0">
        <Row>
          <Col lg="5" className="content-left">
            <ActivityFeed />
          </Col>
          <Col lg="7" className="content-center">
            <div className="post-panel">
              <div className="post-wrapper">
                <SufiyaElizaFirstPost mainImage={1} userImage={1} />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </YearBookLayout>
  );
};

export default ProfileTimeLine;
