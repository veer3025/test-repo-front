// MTak Begin
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC, useState } from "react";
import { Input } from "reactstrap";

interface SearchBarInterface {
  // handleFilterChatUsers : (value: React.ChangeEvent<HTMLInputElement> ) => void;
  handleFilterChatUsers : (value: string ) => void;
  searchFriendText : string,
  setSearchFriendText : React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: FC<SearchBarInterface>= (props) => {
  //props begin
  const {handleFilterChatUsers,searchFriendText,setSearchFriendText}  = props;
  //props end
  const [searchOpen, setSearchOpen] = useState(false);

  //event handler begin
  const searchToogle = () => {
    handleFilterChatUsers("");
    setSearchOpen(!searchOpen);
  };
  //event handler end
  return (
    <div className="search-bar">
      <div className="lg-search">
        <DynamicFeatherIcon
          iconName="Search"
          className="icon-theme icon iw-16"
          onClick={searchToogle}
        />
        <Input className ="text-lowercase" type="text" placeholder="find friends..." value = {searchFriendText} onChange = { (e:React.ChangeEvent<HTMLInputElement>) => {handleFilterChatUsers(e.target.value)} }/>
      </div>
      <div className={`xs-search ${searchOpen ? "open-full" : ""}`}>
        <div className="icon-search">
          <DynamicFeatherIcon
            iconName="Search"
            className="icon-dark  iw-16"
            onClick={searchToogle}
          />
        </div>
        <div className="lg-search">
          <DynamicFeatherIcon
            iconName="Search"
            className="icon-dark icon iw-16"
            onClick={searchToogle}
          />
          <Input className ="text-lowercase" type="text" placeholder="find friends..." value = {searchFriendText} onChange = { (e:React.ChangeEvent<HTMLInputElement>) => {handleFilterChatUsers(e.target.value)} } />
          <div className="icon-close">
            <DynamicFeatherIcon
              iconName="X"
              className="icon-dark iw-16"
              onClick={searchToogle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
