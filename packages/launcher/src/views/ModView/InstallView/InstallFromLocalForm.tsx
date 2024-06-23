import { IS_DEV } from '@/constants';
import Close from '@mui/icons-material/Close';
import CloudUpload from '@mui/icons-material/CloudUploadRounded';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    styled
} from '@mui/material';
import { useCallback, useRef, useState } from 'react';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1
});

export function InstallFromLocalForm() {
    const [open, setOpen] = useState(false);
    const [modFile, setModFile] = useState<File | null>(null);
    const [modSourceMapFile, setModSourceMapFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const uploadModRef = useRef<HTMLInputElement>(null);
    const uploadModSourceMapRef = useRef<HTMLInputElement>(null);

    const handleClose = useCallback(() => {
        setOpen(false);
        setModFile(null);
        setModSourceMapFile(null);
    }, []);

    const handleSelectFile = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        if (v.target.files && v.target.files.length > 0) {
            const file = v.target.files[0];
            if (file.name.endsWith('.js')) {
                setModFile(file);
            } else if (file.name.endsWith('.js.map')) {
                setModSourceMapFile(file);
            }
        }
    }, []);

    if (!IS_DEV) {
        return null;
    }

    return (
        <>
            <Button
                variant="outlined"
                onClick={() => {
                    setOpen(true);
                }}
            >
                从本地安装
            </Button>
            <Dialog
                open={open}
                onClose={(e, reason) => {
                    if (reason === 'backdropClick') {
                        return;
                    } else if (uploading) {
                        // snackbar
                    } else {
                        handleClose();
                    }
                }}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();

                        // 校验
                        // uploading ->
                        // 上传
                        // uploading <-
                        // 获取安装结果？直接安装？
                        // snackbar

                        console.log('here');
                        handleClose();
                    }
                }}
            >
                <DialogTitle>从本地安装</DialogTitle>
                <IconButton
                    aria-label="close"
                    disabled={!uploading}
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8
                    }}
                >
                    <Close />
                </IconButton>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        gap: 4
                    }}
                >
                    <FormControl variant="standard">
                        <InputLabel htmlFor="mod-file">模组文件</InputLabel>
                        <Input
                            id="mod-file"
                            title="mod file"
                            autoComplete="off"
                            value={modFile?.name || ''}
                            endAdornment={
                                <UploadEndAdornment file={modFile} fileInputRef={uploadModRef} setFile={setModFile} />
                            }
                        />
                        <VisuallyHiddenInput
                            ref={uploadModRef}
                            type="file"
                            name="upload-mod"
                            accept="text/javascript"
                            onChange={handleSelectFile}
                        />
                    </FormControl>
                    <FormControl variant="standard">
                        <InputLabel htmlFor="mod-sourcemap-file">模组源映射（可选）</InputLabel>
                        <Input
                            id="mod-sourcemap-file"
                            title="mod sourcemap file"
                            autoComplete="off"
                            value={modSourceMapFile?.name || ''}
                            endAdornment={
                                <UploadEndAdornment
                                    file={modSourceMapFile}
                                    fileInputRef={uploadModSourceMapRef}
                                    setFile={setModSourceMapFile}
                                />
                            }
                        />
                        <VisuallyHiddenInput
                            ref={uploadModSourceMapRef}
                            type="file"
                            name="upload-mod-sourcemap"
                            accept=".js.map"
                            onChange={handleSelectFile}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" type="submit">
                        安装
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface UploadEndAdornmentProps {
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const UploadEndAdornment = ({ file, fileInputRef, setFile }: UploadEndAdornmentProps) => {
    return (
        <InputAdornment position="end">
            {file && (
                <IconButton
                    color="primary"
                    aria-label="clear"
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    onClick={() => {
                        setFile(null);
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>
            )}
            <IconButton
                color="primary"
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
                onClick={() => {
                    fileInputRef.current?.click();
                }}
            >
                <CloudUpload fontSize="small" />
            </IconButton>
        </InputAdornment>
    );
};
