import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'; // For Axios


function App() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState(null);
  const [filteredRecords, setFilterRecord] = useState(null);
  const [notWanted, setNotWanted] = useState({ "title": [], "artist": [], "dated": [] });
  const [baseimageurl, setImageURL] = useState("");
  const [artistName, setArtistName] = useState("");
  const [dated, setDated] = useState("");

  function getRandomPainting(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  // create function that checks whether it's in the prohibited list or not.
  // need hash with attributes and list. 
  // for each record, get those attributes. 
  // if attribute not in hash, then return the record
  // if attribute in hash and value in list, then don't return record.
  // PSEUDOCODE BELOW:
  // function checkRecord(record) {
  //   valid = True
  //   for index, value in notWanted:
  //     const { index } = record
  //   if index in notWanted[index]:
  //     valid = False
  //   break
  //   if valid:
  //     return record
  // }

  // Javascript function below:



  const checkRecord = (record) => {
    let valid = true;

    if (!record.images || record.images.length === 0) {
      console.log("Filtered out record with no images");
      return false; // This record will be filtered out
    }

    if (!record.title || record.title.trim() === "") {
      console.log("Filtered out record with no title");
      return false; // This record will be filtered out
    }

    if (!record.people || record.people.length === 0) {
      console.log("Filtered out record with no people");
      return false; // This record will be filtered out
    }

    for (const attribute in notWanted) {
      const { [attribute]: recordAttribute } = record;

      if (recordAttribute && notWanted[attribute].includes(recordAttribute)) {
        valid = false;
        break;
      }
    }

    return valid; // when true returned to filter, record is included. not when false.
  };




  const fetchPage = async (url) => { // using recursion to re-call until 1000 results retrieved.
    try {
      const response = await axios.get(url);
      const { records: newRecords, info } = response.data;

      setRecords(prevRecords => [...prevRecords, ...newRecords]);

      if (info.next && info.page < 11) { // only 1000 results needed.
        await fetchPage(info.next);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  }

  const fetchData = () => {
    try {
      // add a random num picker formula to get a random image instead of same every time.
      const initialFetch = 'https://api.harvardartmuseums.org/object?apikey=ccbbebc7-c3b0-469c-994f-1877983ab3dd&size=100';
      fetchPage(initialFetch);


      const filteredRecords = records.filter((record) => checkRecord(record));
      setFilterRecord(filteredRecords);

      if (filteredRecords.length > 0) {
        const { title, images, people, dated } = getRandomPainting(filteredRecords);

        const { baseimageurl } = images[0];
        setImageURL(baseimageurl);

        const artist = people[0];
        const { name } = artist;
        setArtistName(name);

        setDated(dated);
        setTitle(title);

      } else {
        console.log("No Objects Found in Database.");
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToNotWantedList = (attribute, identifier) => {
    try {
      notWanted[identifier].push(attribute);
      setNotWanted(notWanted);
      console.log(notWanted);
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // onClick={addToNotWantedList(title, "title")}
  // onClick={addToNotWantedList(artistName, "artist")}
  //onClick={addToNotWantedList(dated, "dated")}

  // will only add latest removals because it looks better on the page.

  return (
    <>
      <h1>Art from around the world</h1>
      <p><b>Utilizing Harvard Art Museum's API to learn about interesting pieces of art.</b></p>
      <button onClick={fetchData}><h3>Discover Art</h3></button>
      <div className="main-container">
        <div className="top-container">
          <div className="painting-container">
            <div className="buttons-container">
              <p>Click on any button below to remove attribute from next art discovery.</p>
              <button className="attribute-buttons" onClick={() => addToNotWantedList(title, "title")}>{title && <p><b>Title:</b> {title}</p>}</button>
              <button className="attribute-buttons" onClick={() => addToNotWantedList(artistName, "artist")}><p><b>Artist:</b> {artistName}</p></button>
              <button className="attribute-buttons" onClick={() => addToNotWantedList(dated, "dated")}><p><b>Dated:</b> {dated}</p></button>
            </div>
          </div>
          <div className="banned-container">
            <h2>Latest Not Wanted Categories</h2>
            <p>Latest Unwanted Title: {notWanted["title"][notWanted["title"].length - 1]}</p>
            <p>Latest Unwated Artist: {notWanted["artist"][notWanted["artist"].length - 1]}</p>
            <p>Latest Unwated Date: {notWanted["dated"][notWanted["dated"].length - 1]}</p>
          </div>
        </div>
        <div className='bottom-container'>
          <h2>Latest Image</h2>
          <img src={baseimageurl} className="img" />
        </div>
      </div>
    </>
  )
}

export default App
