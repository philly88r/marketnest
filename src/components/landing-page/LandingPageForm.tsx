import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// Industry options
const industries = [
  'E-commerce',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Travel',
  'Entertainment',
  'Fitness',
  'Beauty',
  'Home Services',
  'Professional Services',
  'Non-profit',
  'Manufacturing',
  'Other'
];

// Campaign goal options
const campaignGoals = [
  'Lead Generation',
  'Product Sales',
  'Newsletter Signups',
  'Event Registration',
  'Webinar Registration',
  'Free Trial Signup',
  'Brand Awareness',
  'Product Launch',
  'Educational Content Distribution',
  'Other'
];

// Tone options
const toneOptions = [
  'Professional',
  'Friendly',
  'Casual',
  'Authoritative',
  'Humorous',
  'Inspirational',
  'Urgent',
  'Formal',
  'Playful',
  'Conversational'
];

// Color scheme options
const colorSchemeOptions = [
  'Blue & White (Corporate)',
  'Green & White (Eco-friendly)',
  'Red & Black (Bold)',
  'Purple & White (Creative)',
  'Orange & White (Energetic)',
  'Neutral Tones (Sophisticated)',
  'Pastel Colors (Gentle)',
  'Black & White (Minimalist)',
  'Custom (Specify in notes)'
];

interface Product {
  name: string;
  price: string;
  description: string;
}

interface LandingPageFormProps {
  formData: any;
  onChange: (data: any) => void;
}

const LandingPageForm: React.FC<LandingPageFormProps> = ({ formData, onChange }) => {
  const [keyFeature, setKeyFeature] = useState('');
  const [tempProduct, setTempProduct] = useState<Product>({
    name: '',
    price: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      onChange({
        ...formData,
        [name]: target.checked
      });
    } else {
      onChange({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddKeyFeature = () => {
    if (keyFeature.trim() !== '') {
      onChange({
        ...formData,
        keyFeatures: [...formData.keyFeatures, keyFeature]
      });
      setKeyFeature('');
    }
  };

  const handleRemoveKeyFeature = (index: number) => {
    const updatedFeatures = [...formData.keyFeatures];
    updatedFeatures.splice(index, 1);
    onChange({
      ...formData,
      keyFeatures: updatedFeatures
    });
  };

  const handleAddProduct = () => {
    if (tempProduct.name.trim() !== '') {
      onChange({
        ...formData,
        products: [...formData.products, tempProduct]
      });
      setTempProduct({
        name: '',
        price: '',
        description: ''
      });
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: value
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    onChange({
      ...formData,
      products: updatedProducts
    });
  };

  return (
    <FormContainer>
      <Typography variant="h6">Campaign Information</Typography>
      
      <FormSection>
        <FormGroup>
          <Label htmlFor="campaignName">Campaign Name</Label>
          <Input
            id="campaignName"
            name="campaignName"
            value={formData.campaignName}
            onChange={handleChange}
            placeholder="Summer Sale 2025"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your Business Name"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="industry">Industry</Label>
          <Select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select Industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="campaignGoal">Campaign Goal</Label>
          <Select
            id="campaignGoal"
            name="campaignGoal"
            value={formData.campaignGoal}
            onChange={handleChange}
            required
          >
            <option value="">Select Goal</option>
            {campaignGoals.map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <TextArea
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="Describe your target audience (age, interests, pain points, etc.)"
            rows={3}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="callToAction">Call to Action</Label>
          <Input
            id="callToAction"
            name="callToAction"
            value={formData.callToAction}
            onChange={handleChange}
            placeholder="What action do you want visitors to take? (e.g., Sign up, Buy now)"
          />
        </FormGroup>

        <FormGroup>
          <Label>Key Features/Benefits</Label>
          <FeatureInputContainer>
            <Input
              value={keyFeature}
              onChange={(e) => setKeyFeature(e.target.value)}
              placeholder="Add a key feature or benefit"
            />
            <IconButton onClick={handleAddKeyFeature}>
              <FiPlus />
            </IconButton>
          </FeatureInputContainer>
          
          {formData.keyFeatures.length > 0 && (
            <FeatureList>
              {formData.keyFeatures.map((feature: string, index: number) => (
                <FeatureItem key={index}>
                  <FeatureText>{feature}</FeatureText>
                  <IconButton onClick={() => handleRemoveKeyFeature(index)}>
                    <FiTrash2 />
                  </IconButton>
                </FeatureItem>
              ))}
            </FeatureList>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="colorScheme">Color Scheme</Label>
          <Select
            id="colorScheme"
            name="colorScheme"
            value={formData.colorScheme}
            onChange={handleChange}
          >
            <option value="">Select Color Scheme</option>
            {colorSchemeOptions.map((scheme) => (
              <option key={scheme} value={scheme}>{scheme}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="tone">Tone of Voice</Label>
          <Select
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleChange}
          >
            <option value="">Select Tone</option>
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              id="isEcommerce"
              name="isEcommerce"
              checked={formData.isEcommerce}
              onChange={(e) => {
                onChange({
                  ...formData,
                  isEcommerce: e.target.checked
                });
              }}
            />
            <Label htmlFor="isEcommerce">This is an e-commerce landing page</Label>
          </CheckboxContainer>
        </FormGroup>

        {formData.isEcommerce && (
          <FormGroup>
            <Label>Products</Label>
            <ProductInputContainer>
              <ProductInputGroup>
                <Input
                  name="name"
                  value={tempProduct.name}
                  onChange={handleProductChange}
                  placeholder="Product Name"
                />
                <Input
                  name="price"
                  value={tempProduct.price}
                  onChange={handleProductChange}
                  placeholder="Price"
                />
              </ProductInputGroup>
              <TextArea
                name="description"
                value={tempProduct.description}
                onChange={handleProductChange}
                placeholder="Product Description"
                rows={2}
              />
              <IconButton onClick={handleAddProduct}>
                <FiPlus />
              </IconButton>
            </ProductInputContainer>
            
            {formData.products.length > 0 && (
              <ProductList>
                {formData.products.map((prod: any, index: number) => (
                  <ProductItem key={index}>
                    <ProductInfo>
                      <strong>{prod.name}</strong> - {prod.price}
                      <p>{prod.description}</p>
                    </ProductInfo>
                    <IconButton onClick={() => handleRemoveProduct(index)}>
                      <FiTrash2 />
                    </IconButton>
                  </ProductItem>
                ))}
              </ProductList>
            )}
          </FormGroup>
        )}

        <FormGroup>
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <TextArea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any additional information or specific requirements"
            rows={4}
          />
        </FormGroup>
      </FormSection>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Typography = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const FormSection = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  name: props.name,
  id: props.id,
  value: props.value,
  onChange: props.onChange,
  placeholder: props.placeholder,
  required: props.required
}))`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const TextArea = styled.textarea.attrs(props => ({
  name: props.name,
  id: props.id,
  value: props.value,
  onChange: props.onChange,
  placeholder: props.placeholder,
  rows: props.rows
}))`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Select = styled.select.attrs(props => ({
  name: props.name,
  id: props.id,
  value: props.value,
  onChange: props.onChange,
  required: props.required
}))`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Checkbox = styled.input.attrs(props => ({
  type: 'checkbox',
  name: props.name,
  id: props.id,
  checked: props.checked,
  onChange: props.onChange
}))`
  margin-right: 10px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const FeatureInputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #4a90e2;
  padding: 5px;
  border-radius: 4px;
  &:hover {
    background-color: rgba(74, 144, 226, 0.1);
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const FeatureItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const FeatureText = styled.span`
  flex: 1;
`;

const ProductInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProductInputGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const ProductItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
  p {
    margin: 5px 0 0;
    font-size: 14px;
    color: #666;
  }
`;

export default LandingPageForm;