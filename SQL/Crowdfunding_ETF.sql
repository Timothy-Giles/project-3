CREATE TABLE Electric_Vehicle_Population_Data (
    VIN VARCHAR(17) PRIMARY KEY,
    County VARCHAR(50),
    City VARCHAR(50),
    State VARCHAR(2),
    Postal_Code FLOAT,
    Model_Year INTEGER,
    Make VARCHAR(50),
    Model VARCHAR(50),
    Electric_Vehicle_Type VARCHAR(50),
    CAFV_Eligibility VARCHAR(100),
    Electric_Range INTEGER,
    Base_MSRP INTEGER,
    Legislative_District FLOAT,
    DOL_Vehicle_ID INTEGER,
    Vehicle_Location VARCHAR(100),
    Electric_Utility VARCHAR(255),
    Census_Tract FLOAT
);
SELECT * 
FROM Electric_Vehicle_Population_Data;

--delete all the rows with range being equal to 0
DELETE FROM Electric_Vehicle_Population_Data
WHERE Electric_Range = 0;

--delete all the rows where "cafv_eligibility" columns has the value "Not eligible due to low battery range"
DELETE FROM Electric_Vehicle_Population_Data
WHERE CAFV_Eligibility = 'Not eligible due to low battery range';

--list all the distinc counties 
SELECT DISTINCT county
FROM Electric_Vehicle_Population_Data;








