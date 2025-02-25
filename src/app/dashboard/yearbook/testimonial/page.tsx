"use client";
import TestimonialBox from "@/components/Dashboard/Yearbook/TestimonialBox";
import YearBookLayout from "@/layout/YearBookLayout";
import { Container } from "reactstrap";
import { UserProvider } from "@/context/UserContext"; // Adjust path accordingly

const Testimonials = () => {
  return (
    // <UserProvider>
    <YearBookLayout title="testimonial" loaderName="Testimonials">
      <Container fluid className="section-t-space px-0">
        <div className="page-content">
          <div className="content-center w-100">          
            <TestimonialBox/>
          </div>
        </div>
      </Container>
    </YearBookLayout>
    // </UserProvider>
  );
};

export default Testimonials;
