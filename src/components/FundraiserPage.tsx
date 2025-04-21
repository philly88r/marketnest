import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styled from 'styled-components';

interface FundraiserPageProps {
  clientId: string;
  isAdmin: boolean;
}

interface Fundraiser {
  id: string;
  client_id: string;
  name: string;
  logo: string;
  body_text: string;
  website: string;
  additional_info: string;
}

interface FundraiserPhoto {
  id: string;
  fundraiser_id: string;
  photo_url: string;
  caption: string;
  type: string;
  product_name: string | null;
}

const Container = styled.div`
  background: #181d2f;
  color: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
`;
const Section = styled.div`
  margin-bottom: 24px;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
`;
const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #444;
  margin-bottom: 12px;
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #444;
  margin-bottom: 12px;
  min-height: 80px;
`;
const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;
const PhotoItem = styled.div`
  background: #22284b;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
`;
const FundraiserLogo = styled.img`
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const FundraiserPage: React.FC<FundraiserPageProps> = ({ clientId, isAdmin }) => {
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [fundraiserError, setFundraiserError] = useState<string | null>(null);
  const [creatingFundraiser, setCreatingFundraiser] = useState(false);
  const [photos, setPhotos] = useState<FundraiserPhoto[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Fundraiser>>({});
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [landingPageStatus, setLandingPageStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const PRODUCT_NAMES = [
    'french vanilla',
    'medium',
    'dark',
    'hotcoco',
    'pod',
    'decaf roast',
    'pumpkin spice'
  ];

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  // Fundraiser photo upload state
  const [fundraiserPhotoFiles, setFundraiserPhotoFiles] = useState<FileList | null>(null);
  const [fundraiserPhotoUploading, setFundraiserPhotoUploading] = useState(false);
  // Product photo upload state
  const [productPhotoFiles, setProductPhotoFiles] = useState<FileList | null>(null);
  const [productPhotoUploading, setProductPhotoUploading] = useState(false);

  const primaryButtonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold' as const,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px'
  };

  const secondaryButtonStyle = {
    backgroundColor: '#2196F3',
    color: 'white',
    fontWeight: 'bold' as const,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px'
  };

  const dangerButtonStyle = {
    backgroundColor: '#f44336',
    color: 'white',
    fontWeight: 'bold' as const,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px'
  };

  const disabledButtonStyle = {
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  useEffect(() => {
    fetchFundraiser();
    // eslint-disable-next-line
  }, [clientId]);

  async function fetchFundraiser() {
    setFundraiserError(null);
    console.log('Fetching fundraiser for client ID:', clientId);
    
    try {
      const { data, error } = await supabase
        .from('fundraiser_pages')
        .select('*')
        .eq('client_id', clientId)
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
      console.log('Fundraiser fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching fundraiser:', error);
        setFundraiserError('Error loading fundraiser: ' + error.message);
        return;
      }
      
      if (data) {
        // Ensure data has an id, or generate one if missing
        if (!data.id) {
          console.warn('Fundraiser data missing ID, using client_id instead');
          data.id = data.client_id || clientId;
        }
        
        console.log('Setting fundraiser data:', data);
        setFundraiser(data);
        setForm(data);
        
        if (data.id) {
          fetchPhotos(data.id);
        }
      } else {
        console.log('No fundraiser found for client ID:', clientId);
        setFundraiser(null);
      }
    } catch (err) {
      console.error('Exception in fetchFundraiser:', err);
      setFundraiserError('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleCreateFundraiser() {
    setCreatingFundraiser(true);
    setFundraiserError(null);
    console.log('Creating new fundraiser for client ID:', clientId);
    
    try {
      // Insert a new row for this client
      const { data, error } = await supabase.from('fundraiser_pages').insert({
        client_id: clientId,
        name: 'New Fundraiser', // Add a default name instead of empty string
        logo: '',
        body_text: '',
        website: '',
        additional_info: ''
      }).select().single();
      
      console.log('Fundraiser creation result:', { data, error });
      
      setCreatingFundraiser(false);
      if (error || !data) {
        const errorMsg = 'Failed to create fundraiser: ' + (error?.message || 'Unknown error');
        console.error(errorMsg, error);
        setFundraiserError(errorMsg);
        return;
      }
      
      // Ensure data has an id, or generate one if missing
      if (!data.id) {
        console.warn('Created fundraiser missing ID, using client_id instead');
        data.id = data.client_id || clientId;
      }
      
      console.log('Setting new fundraiser data:', data);
      setFundraiser(data);
      setForm(data);
      
      if (data.id) {
        fetchPhotos(data.id);
      }
    } catch (err) {
      setCreatingFundraiser(false);
      console.error('Exception in handleCreateFundraiser:', err);
      setFundraiserError('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function fetchPhotos(fundraiserId: string) {
    if (!fundraiser || !fundraiser.id) return;
    const { data } = await supabase
      .from('fundraiser_photos')
      .select('*')
      .eq('fundraiser_id', fundraiserId);
    setPhotos(data || []);
  }

  async function handleSave() {
    if (!fundraiser) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const { error } = await supabase
        .from('fundraiser_pages')
        .update(form)
        .eq('id', fundraiser.id);
      
      if (error) {
        console.error('Error saving fundraiser:', error);
        setFundraiserError('Failed to save: ' + error.message);
      } else {
        console.log('Fundraiser saved successfully');
        setFundraiser({...fundraiser, ...form});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
      }
    } catch (err) {
      console.error('Exception in handleSave:', err);
      setFundraiserError('Unexpected error while saving: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPhoto() {
    if (!fundraiser || !fundraiser.id || !newPhoto) return;
    setUploading(true);
    const fileExt = newPhoto.name.split('.').pop();
    const filePath = `fundraisers/${fundraiser.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('fundraisers').upload(filePath, newPhoto);
    if (!uploadError) {
      const publicUrl = supabase.storage.from('fundraisers').getPublicUrl(filePath).data.publicUrl;
      await supabase.from('fundraiser_photos').insert({
        fundraiser_id: fundraiser.id,
        photo_url: publicUrl,
        caption: newPhotoCaption,
        type: 'fundraiser',
        product_name: null
      });
      setNewPhoto(null);
      setNewPhotoCaption('');
      fetchPhotos(fundraiser.id);
    }
    setUploading(false);
  }

  async function handleBuildLandingPage() {
    if (!fundraiser) return;
    setLandingPageStatus(null);
    // Separate organization and product photos by caption
    const orgPhotos = photos.filter(photo => !photo.caption?.toLowerCase().includes('product'));
    const productPhotos = photos.filter(photo => photo.caption?.toLowerCase().includes('product'));

    // Use user's HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 16px;">
        <h1 style="text-align:center;">${fundraiser.body_text || ''}</h1>
        <div style="text-align:center; margin-bottom: 16px;">
          ${fundraiser.logo ? `<img src="${fundraiser.logo}" alt="Logo" style="max-width: 160px; margin: 0 auto 20px; display:block;" />` : ''}
        </div>

        <!-- Organization Photos -->
        ${orgPhotos.length > 1 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-bottom: 24px;">
            ${orgPhotos.map(photo => `
              <div style=\"flex: 0 1 220px; background: #fff; border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px #0001;\">
                <img src=\"${photo.photo_url}\" alt=\"${photo.caption}\" style=\"max-width: 200px; border-radius: 6px; margin-bottom: 8px;\" />
                <div style=\"text-align:center; font-size:14px; color:#444;\">${photo.caption}</div>
              </div>
            `).join('')}
          </div>
        ` : orgPhotos.length === 1 ? `
          <div style="text-align:center; margin-bottom: 24px;">
            <img src="${orgPhotos[0].photo_url}" alt="${orgPhotos[0].caption}" style="max-width: 300px; border-radius: 8px;" />
            <div style="font-size:14px; color:#444; margin-top:8px;">${orgPhotos[0].caption}</div>
          </div>
        ` : ''}

        <div style="margin-bottom: 24px;">
          <p><b>Website:</b> <a href="${fundraiser.website || '#'}">${fundraiser.website || ''}</a></p>
          <p><b>Additional Info:</b> ${fundraiser.additional_info || ''}</p>
        </div>

        <!-- Product Photos -->
        ${productPhotos.length > 0 ? `
          <div style="margin-top: 40px;">
            <h2 style="text-align:center;">Products</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
              ${productPhotos.map(photo => `
                <div style=\"flex: 0 1 220px; background: #fff; border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px #0001;\">
                  <img src=\"${photo.photo_url}\" alt=\"${photo.caption}\" style=\"max-width: 200px; border-radius: 6px;\" />
                  <div style=\"text-align:center; font-size:14px; color:#444; margin:8px 0;\">${photo.caption}</div>
                  <a href=\"#\" style=\"display:block; background:#1F53FF; color:white; text-align:center; padding:10px 0; border-radius:6px; text-decoration:none; font-weight:600;\">Buy Now</a>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Get WP creds from env
    const wpUrl = process.env.REACT_APP_WP_API_URL; // e.g. https://yourwp.com/wp-json/wp/v2/pages
    const wpUser = process.env.REACT_APP_WP_USER;
    const wpAppPassword = process.env.REACT_APP_WP_APP_PASSWORD;

    if (!wpUrl || !wpUser || !wpAppPassword) {
      setLandingPageStatus({ success: false, message: 'WordPress credentials are not set in .env.' });
      return;
    }

    try {
      const res = await fetch(wpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${wpUser}:${wpAppPassword}`)
        },
        body: JSON.stringify({
          title: `Fundraiser for ${fundraiser.client_id}`,
          content: html,
          status: 'publish'
        })
      });
      if (res.ok) {
        setLandingPageStatus({ success: true, message: 'Landing page created successfully!' });
      } else {
        const err = await res.json();
        setLandingPageStatus({ success: false, message: 'Failed to create page: ' + (err.message || JSON.stringify(err)) });
      }
    } catch (e) {
      setLandingPageStatus({ success: false, message: 'Error: ' + e });
    }
  }

  // --- Logo upload handler ---
  async function handleLogoUpload() {
    if (!fundraiser || !fundraiser.id || !logoFile) return;
    setLogoUploading(true);
    const fileExt = logoFile.name.split('.').pop();
    const filePath = `fundraisers/${fundraiser.id}/logo.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('fundraisers').upload(filePath, logoFile, { upsert: true });
    if (!uploadError) {
      const publicUrl = supabase.storage.from('fundraisers').getPublicUrl(filePath).data.publicUrl;
      // Insert as a photo row with type 'logo' for consistency
      await supabase.from('fundraiser_photos').insert({
        fundraiser_id: fundraiser.id,
        photo_url: publicUrl,
        caption: 'logo',
        type: 'logo',
        product_name: null
      });
      // Update logo field in fundraiser_pages
      await supabase.from('fundraiser_pages').update({ logo: publicUrl }).eq('id', fundraiser.id);
      fetchFundraiser();
      setLogoFile(null);
    }
    setLogoUploading(false);
  }

  // --- Fundraiser photos upload handler ---
  async function handleFundraiserPhotosUpload() {
    if (!fundraiser || !fundraiser.id || !fundraiserPhotoFiles) return;
    setFundraiserPhotoUploading(true);
    for (const file of Array.from(fundraiserPhotoFiles)) {
      const fileExt = file.name.split('.').pop();
      const filePath = `fundraisers/${fundraiser.id}/org_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('fundraisers').upload(filePath, file);
      if (!uploadError) {
        const publicUrl = supabase.storage.from('fundraisers').getPublicUrl(filePath).data.publicUrl;
        await supabase.from('fundraiser_photos').insert({
          fundraiser_id: fundraiser.id,
          photo_url: publicUrl,
          caption: file.name,
          type: 'fundraiser',
          product_name: null
        });
      }
    }
    fetchPhotos(fundraiser.id);
    setFundraiserPhotoFiles(null);
    setFundraiserPhotoUploading(false);
  }

  // --- Product photos upload handler ---
  async function handleProductPhotosUpload() {
    if (!fundraiser || !fundraiser.id || !productPhotoFiles) return;
    setProductPhotoUploading(true);
    for (const file of Array.from(productPhotoFiles)) {
      const fileExt = file.name.split('.').pop();
      const filePath = `fundraisers/${fundraiser.id}/product_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('fundraisers').upload(filePath, file);
      if (!uploadError) {
        const publicUrl = supabase.storage.from('fundraisers').getPublicUrl(filePath).data.publicUrl;
        const lowerName = file.name.toLowerCase();
        const matchedProduct = PRODUCT_NAMES.find(p => lowerName.includes(p));
        await supabase.from('fundraiser_photos').insert({
          fundraiser_id: fundraiser.id,
          photo_url: publicUrl,
          caption: matchedProduct || file.name,
          type: 'product',
          product_name: matchedProduct || null
        });
      }
    }
    fetchPhotos(fundraiser.id);
    setProductPhotoFiles(null);
    setProductPhotoUploading(false);
  }

  if (fundraiserError) {
    return (
      <Container>
        <div style={{ color: 'red', marginBottom: '16px' }}>{fundraiserError}</div>
        <button 
          onClick={fetchFundraiser} 
          style={{ ...secondaryButtonStyle, marginRight: '8px' }}
        >
          Try Again
        </button>
        <button 
          onClick={handleCreateFundraiser} 
          disabled={creatingFundraiser}
          style={{ 
            ...primaryButtonStyle, 
            ...(creatingFundraiser ? disabledButtonStyle : {})
          }}
        >
          {creatingFundraiser ? 'Creating...' : 'Create New Fundraiser'}
        </button>
      </Container>
    );
  }

  // More lenient check - only require fundraiser to exist, not necessarily fundraiser.id
  if (!fundraiser) {
    return (
      <Container>
        <div>No fundraiser found for this client.</div>
        <button 
          onClick={handleCreateFundraiser} 
          disabled={creatingFundraiser} 
          style={{ 
            ...primaryButtonStyle, 
            marginTop: '16px',
            ...(creatingFundraiser ? disabledButtonStyle : {})
          }}
        >
          {creatingFundraiser ? 'Creating...' : 'Create Fundraiser'}
        </button>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Fundraiser Page</h2>
      
      {saveSuccess && (
        <div style={{ 
          backgroundColor: '#e6ffe6', 
          color: '#006600', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Changes saved successfully!
        </div>
      )}
      
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={() => setEditMode(!editMode)}
            style={secondaryButtonStyle}
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          
          {editMode && (
            <button 
              onClick={handleSave} 
              disabled={saving}
              style={{ 
                ...primaryButtonStyle, 
                ...(saving ? disabledButtonStyle : {})
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      )}
      
      {fundraiser.logo && <FundraiserLogo src={fundraiser.logo} alt="Fundraiser Logo" />}
      {editMode ? (
        <>
          <Section>
            <Label>Fundraiser Name</Label>
            <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Section>
          <Section>
            <Label>Logo URL</Label>
            <Input value={form.logo || ''} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} />
          </Section>
          <Section>
            <Label>Body Text</Label>
            <TextArea value={form.body_text || ''} onChange={e => setForm(f => ({ ...f, body_text: e.target.value }))} />
          </Section>
          <Section>
            <Label>Website</Label>
            <Input value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </Section>
          <Section>
            <Label>Additional Info</Label>
            <TextArea value={form.additional_info || ''} onChange={e => setForm(f => ({ ...f, additional_info: e.target.value }))} />
          </Section>
        </>
      ) : (
        <>
          <Section><strong>Fundraiser Name:</strong> {fundraiser.name}</Section>
          <Section><strong>Body:</strong> {fundraiser.body_text}</Section>
          <Section><strong>Website:</strong> <a href={fundraiser.website} target="_blank" rel="noopener noreferrer">{fundraiser.website}</a></Section>
          <Section><strong>Additional Info:</strong> {fundraiser.additional_info}</Section>
          {(isAdmin || true) && <button onClick={() => setEditMode(true)}>Edit</button>}
        </>
      )}
      <Section>
        <h3>Logo Upload</h3>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} disabled={!fundraiser || !fundraiser.id} />
          <button 
            onClick={handleLogoUpload} 
            disabled={logoUploading || !logoFile || !fundraiser || !fundraiser.id} 
            style={{ 
              ...secondaryButtonStyle, 
              ...(logoUploading || !logoFile || !fundraiser || !fundraiser.id ? disabledButtonStyle : {})
            }}
          >
            {logoUploading ? 'Uploading...' : 'Upload Logo'}
          </button>
        </div>
      </Section>

      <Section>
        <h3>Fundraiser Photos Upload</h3>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input type="file" accept="image/*" multiple onChange={e => setFundraiserPhotoFiles(e.target.files)} disabled={!fundraiser || !fundraiser.id} />
          <button 
            onClick={handleFundraiserPhotosUpload} 
            disabled={fundraiserPhotoUploading || !fundraiserPhotoFiles || !fundraiser || !fundraiser.id} 
            style={{ 
              ...secondaryButtonStyle, 
              ...(fundraiserPhotoUploading || !fundraiserPhotoFiles || !fundraiser || !fundraiser.id ? disabledButtonStyle : {})
            }}
          >
            {fundraiserPhotoUploading ? 'Uploading...' : 'Upload Fundraiser Photos'}
          </button>
        </div>
      </Section>

      <Section>
        <h3>Product Photos Upload</h3>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input type="file" accept="image/*" multiple onChange={e => setProductPhotoFiles(e.target.files)} disabled={!fundraiser || !fundraiser.id} />
          <button 
            onClick={handleProductPhotosUpload} 
            disabled={productPhotoUploading || !productPhotoFiles || !fundraiser || !fundraiser.id} 
            style={{ 
              ...secondaryButtonStyle, 
              ...(productPhotoUploading || !productPhotoFiles || !fundraiser || !fundraiser.id ? disabledButtonStyle : {})
            }}
          >
            {productPhotoUploading ? 'Uploading...' : 'Upload Product Photos'}
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
          Product names recognized: french vanilla, medium, dark, hotcoco, pod, decaf roast, pumpkin spice
        </div>
      </Section>

      <Section>
        <h3>Photos</h3>
        <PhotoGrid>
          {photos.map(photo => (
            <PhotoItem key={photo.id}>
              <img src={photo.photo_url} alt={photo.caption} style={{ maxWidth: '100%', borderRadius: 6 }} />
              <div>{photo.caption}</div>
            </PhotoItem>
          ))}
        </PhotoGrid>
        <div style={{ marginTop: 16 }}>
          <input type="file" accept="image/*" onChange={e => setNewPhoto(e.target.files?.[0] || null)} disabled={!fundraiser || !fundraiser.id} />
          <Input placeholder="Caption" value={newPhotoCaption} onChange={e => setNewPhotoCaption(e.target.value)} disabled={!fundraiser || !fundraiser.id} style={{ margin: '0 10px' }} />
          <button 
            onClick={handleAddPhoto} 
            disabled={uploading || !fundraiser || !fundraiser.id}
            style={{ 
              ...secondaryButtonStyle, 
              ...(uploading || !fundraiser || !fundraiser.id ? disabledButtonStyle : {})
            }}
          >
            {uploading ? 'Uploading...' : 'Add Photo'}
          </button>
        </div>
      </Section>

      <Section>
        <h3>Landing Page</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleBuildLandingPage} 
            disabled={!fundraiser || !fundraiser.id}
            style={{ 
              ...secondaryButtonStyle, 
              ...((!fundraiser || !fundraiser.id) ? disabledButtonStyle : {})
            }}
          >
            Build Landing Page
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ 
              ...primaryButtonStyle, 
              ...(saving ? disabledButtonStyle : {})
            }}
          >
            {saving ? 'Saving...' : 'Save Fundraiser'}
          </button>
          
          <div style={{ fontSize: 13, color: '#666' }}>
            Save your fundraiser details without building a landing page
          </div>
        </div>
        {landingPageStatus && (
          <div style={{ marginTop: 12, color: landingPageStatus.success ? 'green' : 'red' }}>{landingPageStatus.message}</div>
        )}
      </Section>
      
      {/* Save button at the bottom of the page for easy access */}
      {isAdmin && editMode && (
        <div style={{ 
          marginTop: 30, 
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '10px' }}>Done making changes?</p>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ 
              ...primaryButtonStyle,
              padding: '12px 30px',
              fontSize: '16px',
              ...(saving ? disabledButtonStyle : {})
            }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </Container>
  );
};

export default FundraiserPage;
