"use client";
import FriendListBox from "@/components/Dashboard/Yearbook/FriendListBox";
import YearBookLayout from "@/layout/YearBookLayout";
import { Container } from "reactstrap";

const ProfileFriendTimeLine = () => {
  return (
    <YearBookLayout title="friends" loaderName="profileFriend">
      <Container fluid className="section-t-space px-0">
        <div className="page-content">
          <div className="content-center w-100">
            <FriendListBox/>
          </div>
        </div>
      </Container>
    </YearBookLayout>
  );
};

export default ProfileFriendTimeLine;
