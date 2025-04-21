import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFolder, FiFolderPlus, FiFile, FiUpload, FiDownload, 
  FiTrash2, FiCheck, FiX, FiChevronRight
} from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';
import { IconType } from 'react-icons';
import { 
  ClientFile, 
  ClientFolder, 
  getFoldersByClientId, 
  getFilesByClientId, 
  createFolder, 
  uploadFile, 
  deleteFolder, 
  deleteFile, 
  getFileUrl
} from '../utils/clientService';
import { supabase } from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/authService';
import { setupFileSystem, checkFileSystemTables } from '../utils/fileSystemSetup';

// Define a type for the breadcrumb folder
interface BreadcrumbFolder {
  id: string | null;
  name: string;
}

interface ClientFileManagerProps {
  clientId: string;
}

const ClientFileManager: React.FC<ClientFileManagerProps> = ({ clientId }) => {
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbFolder[]>([{ id: null, name: 'Root' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load folders and files
  useEffect(() => {
    const loadFoldersAndFiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if tables exist first and create them if they don't
        const tablesExist = await checkFileSystemTables();
        
        if (!tablesExist) {
          console.log('File system tables do not exist, attempting to create them...');
          const setupResult = await setupFileSystem();
          
          if (!setupResult.success) {
            setError(setupResult.message);
            setIsLoading(false);
            return;
          }
          
          console.log(setupResult.message);
        }
        
        const [folderData, fileData] = await Promise.all([
          getFoldersByClientId(clientId, currentFolder),
          getFilesByClientId(clientId, currentFolder)
        ]);
        
        setFolders(folderData);
        setFiles(fileData);
      } catch (err) {
        console.error('Error loading files and folders:', err);
        setError('Failed to load files and folders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFoldersAndFiles();
  }, [clientId, currentFolder]);
  
  // Handle folder navigation
  const navigateToFolder = async (folderId: string | null, folderName: string) => {
    // If navigating to root, reset breadcrumbs
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Root' }]);
    } else {
      // Add the folder to breadcrumbs
      setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
    }
    
    setCurrentFolder(folderId);
  };
  
  // Handle breadcrumb navigation
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };
  
  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    
    setIsCreatingFolder(true);
    setError(null);
    
    try {
      const createdFolder = await createFolder(
        clientId,
        newFolderName.trim(),
        currentFolder
      );
      
      if (createdFolder) {
        // Add the new folder to the list
        setFolders(prevFolders => [...prevFolders, createdFolder]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
    } finally {
      setIsCreatingFolder(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const file = event.target.files[0];
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const uploadedFile = await uploadFile(
        clientId,
        file,
        currentFolder
      );
      
      if (uploadedFile) {
        // Add the new file to the list
        setFiles(prevFiles => [...prevFiles, uploadedFile]);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Are you sure you want to delete this folder? All files inside will be deleted as well.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteFolder(folderId, clientId);
      
      // Remove the folder from the list
      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Failed to delete folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file deletion
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteFile(fileId, clientId, filePath);
      
      // Remove the file from the list
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file download
  const handleDownloadFile = async (file: ClientFile) => {
    try {
      // If the file already has a URL, use it
      let fileUrl = file.url;
      
      // Otherwise, get a new URL
      if (!fileUrl) {
        fileUrl = await getFileUrl(file.file_path);
      }
      
      if (!fileUrl) {
        throw new Error('Failed to get file URL');
      }
      
      // Open the file URL in a new tab
      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  // Get file icon based on type
  const getFileIcon = (fileType: string): IconType => {
    // You can add more file type icons here
    return FiFile;
  };
  
  return (
    <FileManagerContainer>
      <FileManagerHeader>
        <h3>File Manager</h3>
        <FileManagerActions>
          <ActionButton onClick={() => setIsCreatingFolder(true)}>
            {renderIcon(FiFolderPlus)} New Folder
          </ActionButton>
          <ActionButton onClick={() => fileInputRef.current?.click()}>
            {renderIcon(FiUpload)} Upload Files
          </ActionButton>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            multiple
          />
        </FileManagerActions>
      </FileManagerHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <BreadcrumbsContainer>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator>{renderIcon(FiChevronRight)}</BreadcrumbSeparator>}
            <Breadcrumb
              $active={index === breadcrumbs.length - 1}
              onClick={() => navigateToBreadcrumb(index)}
            >
              {breadcrumb.name}
            </Breadcrumb>
          </React.Fragment>
        ))}
      </BreadcrumbsContainer>
      
      {isLoading ? (
        <LoadingMessage>Loading files and folders...</LoadingMessage>
      ) : (
        <>
          {isCreatingFolder ? (
            <NewFolderForm>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <NewFolderActions>
                <NewFolderButton onClick={handleCreateFolder}>
                  {renderIcon(FiCheck)}
                </NewFolderButton>
                <NewFolderButton onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}>
                  {renderIcon(FiX)}
                </NewFolderButton>
              </NewFolderActions>
            </NewFolderForm>
          ) : null}
          
          <FileListContainer>
            {folders.length === 0 && files.length === 0 ? (
              <EmptyStateMessage>
                This folder is empty. Upload files or create a new folder.
              </EmptyStateMessage>
            ) : (
              <>
                {folders.map(folder => (
                  <FileItem key={folder.id}>
                    <FileItemIcon $isFolder>
                      {renderIcon(FiFolder)}
                    </FileItemIcon>
                    <FileItemInfo onClick={() => navigateToFolder(folder.id, folder.name)}>
                      <FileItemName>{folder.name}</FileItemName>
                      <FileItemMeta>Folder</FileItemMeta>
                    </FileItemInfo>
                    <FileItemActions>
                      <FileItemAction onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}>
                        {renderIcon(FiTrash2)}
                      </FileItemAction>
                    </FileItemActions>
                  </FileItem>
                ))}
                
                {files.map(file => (
                  <FileItem key={file.id}>
                    <FileItemIcon>
                      {renderIcon(getFileIcon(file.file_type))}
                    </FileItemIcon>
                    <FileItemInfo>
                      <FileItemName>{file.name}</FileItemName>
                      <FileItemMeta>
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </FileItemMeta>
                    </FileItemInfo>
                    <FileItemActions>
                      <FileItemAction onClick={() => handleDownloadFile(file)}>
                        {renderIcon(FiDownload)}
                      </FileItemAction>
                      <FileItemAction onClick={() => handleDeleteFile(file.id, file.file_path)}>
                        {renderIcon(FiTrash2)}
                      </FileItemAction>
                    </FileItemActions>
                  </FileItem>
                ))}
              </>
            )}
          </FileListContainer>
        </>
      )}
    </FileManagerContainer>
  );
};

export default ClientFileManager;

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
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
`;

const FileManagerActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: rgba(13, 249, 182, 0.1);
  border: 1px solid rgba(13, 249, 182, 0.3);
  color: #0df9b6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.2);
  }
`;

const BreadcrumbsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const Breadcrumb = styled.span<{ $active: boolean }>`
  font-size: 14px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    color: white;
    text-decoration: ${props => props.$active ? 'none' : 'underline'};
  }
`;

const BreadcrumbSeparator = styled.span`
  color: rgba(255, 255, 255, 0.4);
  margin: 0 8px;
  display: flex;
  align-items: center;
`;

const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const FileItemIcon = styled.div<{ $isFolder?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isFolder ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0, 122, 255, 0.1)'};
  color: ${props => props.$isFolder ? '#ff9500' : '#007aff'};
  border-radius: 8px;
  margin-right: 12px;
  font-size: 20px;
`;

const FileItemInfo = styled.div`
  flex: 1;
  cursor: pointer;
`;

const FileItemName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const FileItemMeta = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const FileItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FileItemAction = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorMessage = styled.div`
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
`;

const NewFolderForm = styled.div`
  display: flex;
  margin-bottom: 15px;
  
  input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: rgba(13, 249, 182, 0.5);
    }
  }
`;

const NewFolderActions = styled.div`
  display: flex;
  gap: 5px;
  margin-left: 10px;
`;

const NewFolderButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
