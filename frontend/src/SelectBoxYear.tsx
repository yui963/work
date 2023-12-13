import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";

interface SelectBoxProps {
  sendYearToApp: (value: number) => void;
}

const SelectBoxYear: React.FC<SelectBoxProps> = ({ sendYearToApp }) => {
  type Year = {
    key: number;
    year: number;
  };

  const generateYears = (startYear: number, endYear: number): Year[] => {
    const years: Year[] = [];

    for (let i = endYear; i >= startYear; i--) {
      const yearObject: Year = {
        key: endYear - i + 1,
        year: i,
      };
      years.push(yearObject);
    }
    return years;
  };
  const Years: Year[] = generateYears(2005, 2023);

  const [SelectedYear, setSelectedYear] = useState<Number | "">("");
  const handleChange = (e: SelectChangeEvent<Number | "">) => {
    setSelectedYear(e.target.value as number);
    const selectedYear = Years.find((year) => year.key === e.target.value);
    if (selectedYear) {
      sendYearToApp(selectedYear.year);
    }
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Year</InputLabel>
        <Select
          label="Year"
          value={SelectedYear}
          onChange={(e) => handleChange(e)}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200, // ポップアップメニューの最大高さを指定
              },
            },
          }}
        >
          {Years.map((obj) => (
            <MenuItem key={obj.key} value={obj.key}>
              {obj.year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default SelectBoxYear;
