import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";

interface SelectBoxProps {
  sendRaceToApp: (name: string) => void;
}

const SelectBoxRace: React.FC<SelectBoxProps> = ({ sendRaceToApp }) => {
  type Race = {
    key: number;
    name: string;
  };

  const raceList: Race[] = [
    { key: 1, name: "フェブラリーS" },
    { key: 2, name: "高松宮記念" },
    { key: 3, name: "大阪杯" },
    { key: 4, name: "桜花賞" },
    { key: 5, name: "皐月賞" },
    { key: 6, name: "天皇賞（春）" },
    { key: 7, name: "NHKマイルカップ" },
    { key: 8, name: "ヴィクトリアマイル" },
    { key: 9, name: "オークス" },
    { key: 10, name: "日本ダービー" },
    { key: 11, name: "安田記念" },
    { key: 12, name: "宝塚記念" },
    { key: 13, name: "スプリンターズS" },
    { key: 14, name: "秋華賞" },
    { key: 15, name: "菊花賞" },
    { key: 16, name: "天皇賞（秋）" },
    { key: 17, name: "エリザベス女王杯" },
    { key: 18, name: "マイルCS" },
    { key: 19, name: "ジャパンC" },
    { key: 20, name: "チャンピオンズC" },
    { key: 21, name: "阪神JF" },
    { key: 22, name: "朝日杯FS" },
    { key: 23, name: "中山大障害" },
    { key: 24, name: "有馬記念" },
    { key: 25, name: "ホープフルS" },
  ];
  const [SelectedRace, setSelectedRace] = useState<Number | "">("");

  const handleChange = (e: SelectChangeEvent<Number | "">) => {
    setSelectedRace(e.target.value as number);
    const selectedRace = raceList.find((race) => race.key === e.target.value);
    if (selectedRace) {
      sendRaceToApp(selectedRace.name);
    }
  };
  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Race</InputLabel>
        <Select
          label="Race"
          value={SelectedRace}
          onChange={(e) => handleChange(e)}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200,
              },
            },
          }}
        >
          {raceList.map((race) => (
            <MenuItem key={race.key} value={race.key}>
              {race.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default SelectBoxRace;
