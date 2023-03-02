import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { mainColor } from "@sa-app/style";
import React from "react";

export interface TextEditDialogProps {
    open: boolean;
    initialValue: string;
    onClose: (value: string) => void;
}

export function TextEditDialog({ open, initialValue, onClose }: TextEditDialogProps) {
    const [value, setValue] = React.useState(initialValue);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={(ev, reason) => {
                if (reason === 'backdropClick') {
                    onClose('');
                } else {
                    onClose(value);
                }
            }}
            sx={{
                '& .MuiDialog-paper': {
                    minWidth: 384,
                    bgcolor: `rgba(${mainColor.front} / 18%)`,
                    backdropFilter: 'blur(4px)',
                },
            }}
        >
            <DialogTitle>编辑</DialogTitle>
            <DialogContent>
                <DialogContentText>以英文逗号分隔</DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="text-battle-manager"
                    fullWidth
                    variant="standard"
                    onChange={handleTextChange}
                    value={value}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onClose(value);
                    }}
                >
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
