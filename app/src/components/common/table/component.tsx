import {
  Link,
  Paper,
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import React from "react";

import { Link as RouterLink } from "react-router-dom";

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

type TableDataEntry =
  | string
  | number
  | {
      name: string | number;
      link?: string;
      action?: (e: React.SyntheticEvent) => any;
    };

interface TableEntryProps {
  entry: TableDataEntry;
}

const TableEntry = (props: TableEntryProps) => {
  const { entry } = props;

  if (typeof entry === "object" && entry.link) {
    return (
      <StyledTableCell component="th" scope="row">
        <Typography>
          <Link component={RouterLink} to={entry.link}>
            {entry.name}
          </Link>
        </Typography>
      </StyledTableCell>
    );
  }

  if (typeof entry === "object" && entry.action) {
    return (
      <StyledTableCell component="th" scope="row">
        <Typography>
          <Link href="#" onClick={entry.action}>
            {entry.name}
          </Link>
        </Typography>
      </StyledTableCell>
    );
  }

  return (
    <StyledTableCell component="th" scope="row">
      {typeof entry === "object" ? entry.name : entry}
    </StyledTableCell>
  );
};

export type TableHeaders = Array<string>;

export type TableData = Array<Array<TableDataEntry>>;

interface TableProps {
  headers: TableHeaders;
  data: TableData;
}

const Table = (props: TableProps) => {
  const { headers, data } = props;

  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <MUITable className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <StyledTableCell key={index}>{header}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length ? (
            data.map((item, index) => (
              <StyledTableRow key={index}>
                {item.map((entry, index) => (
                  <TableEntry key={index} entry={entry} />
                ))}
              </StyledTableRow>
            ))
          ) : (
            <StyledTableRow>
              {headers.map((header) => (
                <TableEntry key={header} entry="—" />
              ))}
            </StyledTableRow>
          )}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

export default Table;
