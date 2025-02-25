import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";

import Link from "next/link";
import React, { FC } from "react";
import { Input } from "reactstrap";
import { YearBookMenuInterFace } from "../LayoutTypes";

interface dataInterFace {
  name: string;
  navigate: string;
  icon: "Clock" | "Info" | "Users" | "Image" | "List" | "MessageSquare";
}

const yearBookMenuData: dataInterFace[] = [
  { navigate: "/dashboard/yearbook/timeline", name: "timeline", icon: "Clock" },
  // { navigate: "/dashboard/yearbook/about", name: "about", icon: "Info" },
  { navigate: "/dashboard/yearbook/friends", name: "friends", icon: "Users" },
  { navigate: "/dashboard/yearbook/gallery", name: "photos", icon: "Image" },
  { navigate: "/dashboard/yearbook/testimonial", name: "testimonial", icon: "MessageSquare" },  
];


const YearBookMenu: FC<YearBookMenuInterFace> = ({title}) => {
  return (
    <div className="profile-menu section-t-space">
      <ul>
        {yearBookMenuData.map((data, index) => (
          <li className={`${data.name === title  ? "active":""} ${data.name === "acitivity feed" ?"d-xl-none d-inline-block":""}`} key={index}>
            <Link href={data.navigate}>
              <DynamicFeatherIcon iconName={data.icon} className="iw-14 ih-14"/>
              <h6>{data.name}</h6>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="right-menu d-xl-flex d-none">
        <li>
          <div className="search-bar input-style icon-left search-inmenu">
            <DynamicFeatherIcon iconName="Search" className="iw-16 ih-16 icon icon-theme"/>
            <Input type="text" placeholder="search here..." />
          </div>
        </li>       
      </ul>
    </div>
  );
};

export default YearBookMenu;
