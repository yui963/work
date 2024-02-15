import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import { useEffect } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
function createData(name: string, year: number, detail: string) {
  return { name, year, detail };
}

const rows = [
  createData("C", 2, "高校＋大学"),
  createData("Java", 2, "高校＋大学"),
  createData("Python", 0.5, "独学"),
  createData("JavaScript / TypeScript", 0.5, "独学"),
  createData("MySQL", 0.5, "大学"),
  createData("React", 0.5, "独学"),
  createData("Unity", 0.5, "独学"),
];

const About = () => {
  useEffect(() => {
    document.title = 'About';
  }, []);
  return (
    <>
      <Box marginLeft={2} marginRight={2}>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="border"
            variant="h4"
            fontWeight="bold"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            Profile
          </Typography>
          <Box sx={{ marginTop: "20px" }} />
          <Typography
            className="context"
            variant="h5"
            align="left"
            fontWeight="bold"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            山本 唯翔
          </Typography>
        </Box>
        <Box sx={{ marginTop: "10px" }}>
          <Typography
            className="context"
            variant="body1"
            align="left"
            fontWeight="bold"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            静岡県立科学技術高等学校情報システム科卒業
            <br />
            静岡大学情報学部情報科学科卒業見込み
          </Typography>
          <div className="context"
            style={{ display: "flex", flexDirection: "row", marginTop: "20px" }}
          >
            <img src="./img/github_icon.png" width="3%" height="3%" />
            <Typography
              className="context"
              component="a"
              variant="body1"
              href="https://github.com/yui963/work"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              https://github.com/yui963/work
            </Typography>
          </div>
          <div className="context"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <EmailIcon />
            <Typography
              className="context"
              variant="body1"
              sx={{ fontFamily: "Noto Serif JP, serif" }}
            >
              yamamoto.yuito.21@shizuoka.ac.jp
            </Typography>
          </div>
        </Box>
        <Box sx={{ marginTop: "100px" }}>
          <Typography
            className="border"
            variant="h4"
            fontWeight="bold"
            align="left"
            sx={{ fontFamily: "Noto Serif JP, serif" }}
          >
            Skills
          </Typography>
        </Box>
        <Box className="context" sx={{ marginTop: "20px" }}>
          <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
            <Table aria-label="customized table">
              <TableHead>
                {" "}
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell align="right">Year</StyledTableCell>
                  <StyledTableCell align="right">Detail</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <StyledTableRow key={row.name}>
                    <StyledTableCell component="th" scope="row">
                      {row.name}
                    </StyledTableCell>
                    <StyledTableCell align="right">{row.year}</StyledTableCell>
                    <StyledTableCell align="right">{row.detail}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box >
        <Box sx={{ marginTop: "200px" }} />
      </Box >
    </>
  );
};

export default About;
