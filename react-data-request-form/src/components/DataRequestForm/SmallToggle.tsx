import React from "react";
import { Switch, FormControlLabel, Box, Typography } from "@mui/material";

interface SmallToggleProps {
  leftLabel: string;
  rightLabel: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inline?: boolean;
}

const SmallToggle: React.FC<SmallToggleProps> = ({ 
    leftLabel, rightLabel, checked, onChange, inline = false }) => {
        const buttonStyle = (isActive: boolean) => ({
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center" as const,
            padding: "2px 6px",
            border: "1px solid #ccc",
            backgroundColor: isActive ? "#2573e7dc" : "#f8f9fa",
            color: isActive ? "#fff" : "#333",
            fontWeight: isActive ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            fontSize: "0.85rem",
            lineHeight: 1.2,
            whiteSpace: "nowrap" as const,
        })
        const groupStyle = {
            display: "flex",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid #ccc",
            width: "fit-content",
        };
        return (
            <Box
            display={inline ? "inline-flex" : "flex"}
            alignItems="center"
            sx={{
                ...(inline ? { marginLeft: "0.75rem" } : { marginTop: "0.5rem" }),
            }}
            >
            <Box sx={groupStyle}>
                <Box
                sx={{
                    ...buttonStyle(!checked),
                    borderRight: "none",
                }}
                onClick={() =>
                    onChange({
                    target: { checked: false },
                    } as React.ChangeEvent<HTMLInputElement>)
                }
                >
                <Typography variant="body2">{leftLabel}</Typography>
                </Box>
                <Box
                sx={buttonStyle(checked)}
                onClick={() =>
                    onChange({
                    target: { checked: true },
                    } as React.ChangeEvent<HTMLInputElement>)
                }
                >
                <Typography variant="body2">{rightLabel}</Typography>
                </Box>
            </Box>
            </Box>
        );
    };

export default SmallToggle;
