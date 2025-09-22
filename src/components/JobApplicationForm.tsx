import React, { useState, useEffect } from 'react';
import {
  JobApplication,
  CreateJobApplicationDto,
  UpdateJobApplicationDto,
  JobApplicationFormData,
  FormErrors,
  ApplicationStatus,
  getStatusOptions,
  formatDateForInput
} from '../types/JobApplication';
import { JobApplicationService } from '../services/JobApplicationService';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';

interface JobApplicationFormProps {
  jobApplication?: JobApplication; // If provided, form is in edit mode
  onSuccess: (jobApplication: JobApplication) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobApplication,
  onSuccess,
  onCancel,
  isVisible
}) => {
  const [formData, setFormData] = useState<JobApplicationFormData>({
    company: '',
    position: '',
    status: ApplicationStatus.Applied,
    dateApplied: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // Initialize form when jobApplication prop changes
  useEffect(() => {
    if (jobApplication) {
      setIsEdit(true);
      setFormData({
        company: jobApplication.company,
        position: jobApplication.position,
        status: jobApplication.status,
        dateApplied: formatDateForInput(jobApplication.dateApplied)
      });
    } else {
      setIsEdit(false);
      setFormData({
        company: '',
        position: '',
        status: ApplicationStatus.Applied,
        dateApplied: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [jobApplication]);

  // Reset form when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isVisible]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.trim().length > 200) {
      newErrors.company = 'Company name must be 200 characters or less';
    }

    // Position validation
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    } else if (formData.position.trim().length > 200) {
      newErrors.position = 'Position must be 200 characters or less';
    }

    // Status validation
    if (!Object.values(ApplicationStatus).includes(formData.status)) {
      newErrors.status = 'Please select a valid status';
    }

    // Date validation
    if (!formData.dateApplied) {
      newErrors.dateApplied = 'Date applied is required';
    } else {
      const selectedDate = new Date(formData.dateApplied);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (selectedDate > today) {
        newErrors.dateApplied = 'Date applied cannot be in the future';
      } else if (selectedDate < oneYearAgo) {
        newErrors.dateApplied = 'Date applied cannot be more than one year ago';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value) as ApplicationStatus : value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEdit && jobApplication) {
        // Update existing application
        const updateDto: UpdateJobApplicationDto = {
          company: formData.company.trim(),
          position: formData.position.trim(),
          status: formData.status,
          dateApplied: new Date(formData.dateApplied).toISOString()
        };

        const updatedApp = await JobApplicationService.update(jobApplication.id, updateDto);
        onSuccess(updatedApp);
      } else {
        // Create new application
        const createDto: CreateJobApplicationDto = {
          company: formData.company.trim(),
          position: formData.position.trim(),
          status: formData.status,
          dateApplied: new Date(formData.dateApplied).toISOString()
        };

        const newApp = await JobApplicationService.create(createDto);
        
        // Reset form to default values after successful creation
        setFormData({
          company: '',
          position: '',
          status: ApplicationStatus.Applied,
          dateApplied: new Date().toISOString().split('T')[0]
        });
        
        onSuccess(newApp);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setErrors({
        general: error.message || 'An error occurred while saving the application'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      company: '',
      position: '',
      status: ApplicationStatus.Applied,
      dateApplied: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    onCancel();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal show={isVisible} onHide={handleCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? 'Edit Job Application' : 'Add New Job Application'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {errors.general && (
          <Alert variant="danger" className="mb-3">
            {errors.general}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Company Name *</Form.Label>
            <Form.Control
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Enter company name"
              autoComplete="off"
              maxLength={200}
              disabled={isSubmitting}
              isInvalid={!!errors.company}
            />
            <Form.Control.Feedback type="invalid">
              {errors.company}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Position *</Form.Label>
            <Form.Control
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Enter position title"
              autoComplete="off"
              maxLength={200}
              disabled={isSubmitting}
              isInvalid={!!errors.position}
            />
            <Form.Control.Feedback type="invalid">
              {errors.position}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status *</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
              isInvalid={!!errors.status}
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.status}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Date Applied *</Form.Label>
            <Form.Control
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleInputChange}
              disabled={isSubmitting}
              max={new Date().toISOString().split('T')[0]}
              isInvalid={!!errors.dateApplied}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateApplied}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            isEdit ? 'Update Application' : 'Add Application'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JobApplicationForm;