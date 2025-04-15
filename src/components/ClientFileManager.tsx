import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFolder, FiFolderPlus, FiFile, FiUpload, FiDownload, 
  FiTrash2, FiCheck, FiX, FiChevronRight
} from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';

// Mock service functions and types for client files
interface ClientFile {
  id: string;
  name: string;
  size: number;
  type: string;
  folderId: string | null;
  uploadDate: string;
  clientId: string;
}

interface ClientFolder {
  id: string;
  name: string;
  parentId: string | null;
  clientId: string;
}

// Mock service functions
const getFilesByClientId = (clientId: string, folderId: string | null): Promise<ClientFile[]> => {
  return Promise.resolve([]);
};

const getFoldersByClientId = (clientId: string, parentId: string | null): Promise<ClientFolder[]> => {
  return Promise.resolve([]);
};

const createFolder = (name: string, parentId: string | null, clientId: string): Promise<ClientFolder> => {
  return Promise.resolve({ id: '1', name, parentId, clientId });
};

const uploadFile = (file: File, folderId: string | null, clientId: string, onProgress: (progress: number) => void): Promise<ClientFile> => {
  return Promise.resolve({
    id: '1',
    name: file.name,
    size: file.size,
    type: file.type,
    folderId,
    uploadDate: new Date().toISOString(),
    clientId
  });
};

const deleteFile = (fileId: string): Promise<void> => {
  return Promise.resolve();
};

const deleteFolder = (folderId: string): Promise<void> => {
  return Promise.resolve();
};

const downloadFile = (file: ClientFile): void => {
  // Mock implementation
};

interface ClientFileManagerProps {
  clientId: string;
}

const ClientFileManager: React.FC<ClientFileManagerProps> = ({ clientId }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: 'Root' }
  ]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to load files and folders
  const loadFiles = async (folderId: string | null): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [filesData, foldersData] = await Promise.all([
        getFilesByClientId(clientId, folderId),
        getFoldersByClientId(clientId, folderId)
      ]);
      
      setFiles(filesData);
      setFolders(foldersData);
    } catch (err) {
      setError('Failed to load files. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load files and folders on mount and when folder changes
  useEffect(() => {
    loadFiles(currentFolderId);
  }, [clientId, currentFolderId]);
  
  // Handle folder navigation
  const navigateToFolder = (folderId: string | null, folderName: string): void => {
    // Find the index of the folder in the history
    const folderIndex = folderHistory.findIndex((f: { id: string | null }) => f.id === folderId);
    
    if (folderIndex >= 0) {
      // If the folder is in the history, truncate the history to that point
      setFolderHistory((prev: Array<{ id: string | null; name: string }>) => prev.slice(0, folderIndex + 1));
    } else {
      // If it's a new folder, add it to the history
      setFolderHistory((prev: Array<{ id: string | null; name: string }>) => [...prev, { id: folderId, name: folderName }]);
    }
    
    setCurrentFolderId(folderId);
    loadFiles(folderId);
  };
  
  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newFolder = await createFolder(newFolderName, currentFolderId, clientId);
      
      setFolders((prevFiles: ClientFolder[]) => [...prevFiles, newFolder]);
      setIsCreatingFolder(false);
      setNewFolderName('');
    } catch (err) {
      setError('Failed to create folder. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      const uploadedFile = await uploadFile(
        file,
        currentFolderId,
        clientId,
        (progress: number) => setUploadProgress(progress)
      );
      
      setFiles((prevFiles: ClientFile[]) => [...prevFiles, uploadedFile]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle file download
  const handleFileDownload = (file: ClientFile) => {
    downloadFile(file);
  };
  
  // Handle file deletion
  const handleDeleteFile = async (file: ClientFile) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteFile(file.id);
      
      setFiles((prevFiles: ClientFile[]) => prevFiles.filter((f: ClientFile) => f.id !== file.id));
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle folder deletion
  const handleDeleteFolder = async (folder: ClientFolder) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteFolder(folder.id);
      
      setFolders((prevFolders: ClientFolder[]) => prevFolders.filter((f: ClientFolder) => f.id !== folder.id));
    } catch (err) {
      setError('Failed to delete folder. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return '🖼️';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return '📑';
    } else {
      return '📁';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <FileManagerContainer>
      <FileManagerHeader>
        <h3>File Manager</h3>
        <FileManagerActions>
          <ActionButton 
            onClick={() => setIsCreatingFolder(true)}
            disabled={isCreatingFolder}
          >
            {renderIcon(FiFolderPlus)} New Folder
          </ActionButton>
          <ActionButton onClick={() => fileInputRef.current?.click()}>
            {renderIcon(FiUpload)} Upload File
          </ActionButton>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </FileManagerActions>
      </FileManagerHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {isUploading && (
        <UploadProgressContainer>
          <ProgressBar $progress={uploadProgress} />
          <ProgressText>{uploadProgress}% Uploading...</ProgressText>
        </UploadProgressContainer>
      )}
      
      <BreadcrumbContainer>
        {folderHistory.map((folder, index) => (
          <React.Fragment key={folder.id || 'root'}>
            {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            <Breadcrumb
              onClick={() => navigateToFolder(folder.id, folder.name)}
              $active={index === folderHistory.length - 1}
            >
              {folder.name}
            </Breadcrumb>
          </React.Fragment>
        ))}
      </BreadcrumbContainer>
      
      <FileListContainer>
        {isLoading ? (
          <LoadingMessage>Loading files and folders...</LoadingMessage>
        ) : (
          <>
            {isCreatingFolder && (
              <NewFolderForm>
                <NewFolderInput
                  type="text"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
                <NewFolderActions>
                  <NewFolderButton onClick={handleCreateFolder}>
                    {renderIcon(FiCheck)}
                  </NewFolderButton>
                  <NewFolderButton onClick={() => setIsCreatingFolder(false)}>
                    {renderIcon(FiX)}
                  </NewFolderButton>
                </NewFolderActions>
              </NewFolderForm>
            )}
            
            {folders.length === 0 && files.length === 0 ? (
              <EmptyStateMessage>
                {currentFolderId === null 
                  ? "This client doesn't have any files or folders yet." 
                  : "This folder is empty."}
              </EmptyStateMessage>
            ) : (
              <>
                {/* Folders */}
                {folders.map(folder => (
                  <FileListItem key={`folder-${folder.id}`}>
                    <FileItemIcon $isFolder>
                      {renderIcon(FiFolder)}
                    </FileItemIcon>
                    <FileItemName onClick={() => navigateToFolder(folder.id, folder.name)}>
                      {folder.name}
                    </FileItemName>
                    <FileItemActions>
                      <FileItemAction onClick={() => handleDeleteFolder(folder)}>
                        {renderIcon(FiTrash2)}
                      </FileItemAction>
                    </FileItemActions>
                  </FileListItem>
                ))}
                
                {/* Files */}
                {files.map(file => (
                  <FileListItem key={`file-${file.id}`}>
                    <FileItemIcon>
                      {renderIcon(FiFile)}
                    </FileItemIcon>
                    <FileItemName>{file.name}</FileItemName>
                    <FileItemMeta>
                      {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                    </FileItemMeta>
                    <FileItemActions>
                      <FileItemAction onClick={() => handleFileDownload(file)}>
                        {renderIcon(FiDownload)}
                      </FileItemAction>
                      <FileItemAction onClick={() => handleDeleteFile(file)}>
                        {renderIcon(FiTrash2)}
                      </FileItemAction>
                    </FileItemActions>
                  </FileListItem>
                ))}
              </>
            )}
          </>
        )}
      </FileListContainer>
    </FileManagerContainer>
  );
};

// Styled Components
const FileManagerContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const FileManagerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const FileManagerActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(31, 83, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(31, 83, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 67, 67, 0.1);
  border: 1px solid rgba(255, 67, 67, 0.3);
  color: #ff4343;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const UploadProgressContainer = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin-bottom: 8px;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, #1F53FF, #FF43A3);
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const Breadcrumb = styled.div<{ $active: boolean }>`
  font-size: 14px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
    text-decoration: ${props => props.$active ? 'none' : 'underline'};
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.4);
`;

const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-size: 15px;
`;

const NewFolderForm = styled.div`
  display: flex;
  margin-bottom: 15px;
  background: rgba(31, 83, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
  border: 1px dashed rgba(31, 83, 255, 0.3);
`;

const NewFolderInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
  }
`;

const NewFolderActions = styled.div`
  display: flex;
  gap: 5px;
  margin-left: 10px;
`;

const NewFolderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:first-child {
    background: rgba(52, 199, 89, 0.2);
    color: #34c759;
    
    &:hover {
      background: rgba(52, 199, 89, 0.3);
    }
  }
  
  &:last-child {
    background: rgba(255, 67, 67, 0.2);
    color: #ff4343;
    
    &:hover {
      background: rgba(255, 67, 67, 0.3);
    }
  }
`;

const FileListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const FileItemIcon = styled.div<{ $isFolder?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${props => props.$isFolder 
    ? 'rgba(255, 149, 0, 0.1)' 
    : 'rgba(31, 83, 255, 0.1)'};
  color: ${props => props.$isFolder ? '#ff9500' : '#1F53FF'};
  margin-right: 15px;
  font-size: 18px;
`;

const FileItemName = styled.div`
  flex: 1;
  font-size: 15px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FileItemMeta = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 15px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const FileItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FileItemAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &:first-child {
    color: #1F53FF;
    
    &:hover {
      background: rgba(31, 83, 255, 0.1);
    }
  }
  
  &:last-child {
    color: #ff4343;
    
    &:hover {
      background: rgba(255, 67, 67, 0.1);
    }
  }
`;

export default ClientFileManager;
