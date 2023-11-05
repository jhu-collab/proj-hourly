import { merge } from "lodash";
import Alert from "./Alert";
import AlertTitle from "./AlertTitle";
import Badge from "./Badge";
import Button from "./Button";
import CardContent from "./CardContent";
import Checkbox from "./Checkbox";
import Chip from "./Chip";
import DataGrid from "./DataGrid";
import IconButton from "./IconButton";
import InputLabel from "./InputLabel";
import LinearProgress from "./LinearProgress";
import Link from "./Link";
import ListItemIcon from "./ListItemIcon";
import OutlinedInput from "./OutlinedInput";
import Tab from "./Tab";
import TableCell from "./TableCell";
import Tabs from "./Tabs";
import TextField from "./TextField";
import ToggleButton from "./ToggleButton";
import Typography from "./Typography";

export default function ComponentsOverrides(theme) {
  return merge(
    Alert(),
    AlertTitle(),
    Button(theme),
    Badge(theme),
    CardContent(),
    Checkbox(theme),
    Chip(theme),
    DataGrid(theme),
    IconButton(theme),
    InputLabel(theme),
    LinearProgress(),
    Link(),
    ListItemIcon(),
    OutlinedInput(theme),
    Tab(theme),
    TableCell(theme),
    Tabs(),
    TextField(),
    ToggleButton(theme),
    Typography()
  );
}
