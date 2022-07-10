import PropTypes from "prop-types";
import { useState } from "react";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import reactElementToJSXString from "react-element-to-jsx-string";
import { CodeOutlined, CopyOutlined } from "@ant-design/icons";

function MainCardFooter({ children }) {
  const [showFooter, setShowFooter] = useState(false);
  return (
    <Box sx={{ position: "relative" }}>
      <CardActions
        sx={{ justifyContent: "flex-end", p: 1, mb: showFooter ? 1 : 0 }}
      >
        <Box sx={{ display: "flex", position: "inherit", right: 0, top: 6 }}>
          <CopyToClipboard
            text={reactElementToJSXString(children, {
              showFunctions: true,
              maxInlineAttributesLineLength: 100,
            })}
          >
            <Tooltip title="Copy the source" placement="top-end">
              <IconButton
                color="secondary"
                size="small"
                sx={{ fontSize: "0.875rem" }}
              >
                <CopyOutlined />
              </IconButton>
            </Tooltip>
          </CopyToClipboard>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ mx: 1 }}
          />
          <Tooltip title="Show card footer" placement="top-end">
            <IconButton
              sx={{ fontSize: "0.875rem" }}
              size="small"
              color={showFooter ? "primary" : "secondary"}
              onClick={() => setShowFooter(!showFooter)}
            >
              <CodeOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
      <Collapse in={showFooter}>
        {showFooter && <CardContent>Card Footer</CardContent>}
      </Collapse>
    </Box>
  );
}

MainCardFooter.propTypes = {
  children: PropTypes.node,
};

export default MainCardFooter;
