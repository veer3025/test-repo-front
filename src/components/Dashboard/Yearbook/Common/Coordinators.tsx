"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC , useState , useEffect } from "react";
import { Media ,Spinner } from "reactstrap";
import CustomImage from "../../../../Common/CustomImage";
import { ImagePath } from "../../../../utils/constant";
import { getCoordinators } from "@/libs/common"

const Coordinators: FC = () => {
    
    const [CoordinatorsData, setCoordinatorsData] = useState<any[]>([]); 
    
    const fetchCoordinator = async () => {
      try {
        
        let coordinators = await getCoordinators();  
        setCoordinatorsData(coordinators);
      } catch (error) {
        console.error("Error fetching coordinators:", error);
      } 
    };
  
    useEffect(() => {
      fetchCoordinator();
    }, []);
    
  return (    
    
    <div className="page-list section-t-space">
        <div className="card-title p-3">
            <h4>Coordinators</h4>      
        </div>       
        <div className="list-content">      
            {CoordinatorsData.length === 0 ? (
                <div className="text-center my-4 p-5">
                <Spinner color="info">Loading...</Spinner>
                </div>
            ) : (
                <ul>
                {CoordinatorsData.map((data, index) => (
                    <li key={index} className="p-3">
                    <Media>
                        <div
                            className="img-part bg-size blur-up lazyloaded"
                            style={{
                            backgroundImage: `url("${ImagePath}/user.jpg")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                            display: "block",
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            }}
                        />
                        <Media body>
                            <h4 style={{ display: "inline-flex", alignItems: "center", gap: "11px" }}>
                            {data.u_name}
                            </h4>
                            <h6>{data.email}</h6>
                        </Media>
                    </Media>            
                </li>
                ))}
                </ul>
            )}      
        </div>
  </div>   
  );
};

export default Coordinators;
