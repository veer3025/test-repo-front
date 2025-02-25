"use client";
import CommonGalleryPhotos from "@/Common/CommonGalleryPhotos";
import YearBookLayout from "@/layout/YearBookLayout";
import { Container } from "reactstrap";

const ProfileGalleryTimeLine = () => {
  return (
    <YearBookLayout title="photos" loaderName="profileGallery">
      <Container fluid className="section-t-space px-0">
        <div className="page-content">
          <div className="content-center w-100">
            <CommonGalleryPhotos />
          </div>
        </div>
      </Container>
    </YearBookLayout>
  );
};

export default ProfileGalleryTimeLine;
