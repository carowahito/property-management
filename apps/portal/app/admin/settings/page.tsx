'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [isSaving, setIsSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  // WhatsApp Settings
  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: '',
    businessId: '',
    phoneNumberId: '',
    webhookUrl: '',
    enabled: false,
  })

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    customProviderName: '',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    apiEndpoint: '',
    enabled: false,
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    provider: 'smtp',
    customProviderName: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    apiKey: '',
    apiEndpoint: '',
    enabled: false,
  })

  // CRM Settings
  const [crmSettings, setCrmSettings] = useState({
    provider: 'salesforce',
    customProviderName: '',
    apiKey: '',
    apiSecret: '',
    instanceUrl: '',
    webhookUrl: '',
    enabled: false,
  })

  // LLM Settings
  const [llmSettings, setLlmSettings] = useState({
    provider: 'openai',
    customProviderName: '',
    apiKey: '',
    apiEndpoint: '',
    model: 'gpt-4',
    temperature: '0.7',
    maxTokens: '2000',
    enabled: false,
  })

  const handleSave = async (settingType: string) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Saving settings:', settingType)
    setIsSaving(false)
    alert('Settings saved successfully!')
  }

  const handleTestConnection = async (settingType: string) => {
    setTestingConnection(settingType)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setTestingConnection(null)
    alert(`${settingType} connection successful!`)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-2">Manage API keys and integrations for your property management system</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'whatsapp'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                📱 WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'sms'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                💬 SMS
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'email'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                📧 Email
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'crm'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                🔗 CRM Integration
              </button>
              <button
                onClick={() => setActiveTab('llm')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'llm'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                🤖 AI / LLM
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* WhatsApp Settings */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">WhatsApp Business API</h2>
                    <p className="text-sm text-neutral-600 mt-1">Configure WhatsApp Business API for tenant communications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappSettings.enabled}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">
                      {whatsappSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">Setup Instructions</p>
                      <ol className="text-xs text-primary-700 mt-2 list-decimal list-inside space-y-1">
                        <li>Create a WhatsApp Business Account at business.facebook.com</li>
                        <li>Set up a Meta Business App and get your API credentials</li>
                        <li>Add a phone number and verify it with WhatsApp</li>
                        <li>Generate an access token and copy it below</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      API Key / Access Token *
                    </label>
                    <input
                      type="password"
                      value={whatsappSettings.apiKey}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your WhatsApp API access token"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Business Account ID *
                    </label>
                    <input
                      type="text"
                      value={whatsappSettings.businessId}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, businessId: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your WhatsApp Business Account ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone Number ID *
                    </label>
                    <input
                      type="text"
                      value={whatsappSettings.phoneNumberId}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumberId: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your Phone Number ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="text"
                      value={whatsappSettings.webhookUrl}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://your-domain.com/api/webhooks/whatsapp"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      URL to receive WhatsApp message delivery updates and responses
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleSave('whatsapp')}
                    disabled={isSaving || !whatsappSettings.apiKey}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('WhatsApp')}
                    disabled={testingConnection !== null || !whatsappSettings.apiKey}
                  >
                    {testingConnection === 'WhatsApp' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            )}

            {/* SMS Settings */}
            {activeTab === 'sms' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">SMS Gateway</h2>
                    <p className="text-sm text-neutral-600 mt-1">Configure SMS provider for tenant notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsSettings.enabled}
                      onChange={(e) => setSmsSettings({ ...smsSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">
                      {smsSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    SMS Provider *
                  </label>
                  <select
                    value={smsSettings.provider}
                    onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="messagebird">MessageBird</option>
                    <option value="vonage">Vonage (Nexmo)</option>
                    <option value="plivo">Plivo</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>

                {/* Custom Provider Name */}
                {smsSettings.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      value={smsSettings.customProviderName}
                      onChange={(e) => setSmsSettings({ ...smsSettings, customProviderName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your custom SMS provider name"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {smsSettings.provider === 'custom' ? 'API Key / Account ID' : 'Account SID'} *
                    </label>
                    <input
                      type="text"
                      value={smsSettings.accountSid}
                      onChange={(e) => setSmsSettings({ ...smsSettings, accountSid: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={smsSettings.provider === 'custom' ? 'Enter your API key or account ID' : 'Enter your account SID'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {smsSettings.provider === 'custom' ? 'API Secret / Auth Token' : 'Auth Token'} *
                    </label>
                    <input
                      type="password"
                      value={smsSettings.authToken}
                      onChange={(e) => setSmsSettings({ ...smsSettings, authToken: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={smsSettings.provider === 'custom' ? 'Enter your API secret or auth token' : 'Enter your auth token'}
                    />
                  </div>

                  {smsSettings.provider === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        API Endpoint *
                      </label>
                      <input
                        type="text"
                        value={smsSettings.apiEndpoint}
                        onChange={(e) => setSmsSettings({ ...smsSettings, apiEndpoint: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://api.yourprovider.com/v1/sms"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        The API endpoint URL for sending SMS messages
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      From Phone Number *
                    </label>
                    <input
                      type="text"
                      value={smsSettings.fromNumber}
                      onChange={(e) => setSmsSettings({ ...smsSettings, fromNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+1234567890"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Your SMS-enabled phone number (include country code)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleSave('sms')}
                    disabled={isSaving || !smsSettings.accountSid}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('SMS')}
                    disabled={testingConnection !== null || !smsSettings.accountSid}
                  >
                    {testingConnection === 'SMS' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Email Configuration</h2>
                    <p className="text-sm text-neutral-600 mt-1">Configure email provider for communications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.enabled}
                      onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">
                      {emailSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Provider *
                  </label>
                  <select
                    value={emailSettings.provider}
                    onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="smtp">SMTP (Standard)</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                    <option value="postmark">Postmark</option>
                    <option value="custom">Custom API Provider</option>
                  </select>
                </div>

                {/* Custom Provider Name */}
                {emailSettings.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      value={emailSettings.customProviderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, customProviderName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your custom email provider name"
                    />
                  </div>
                )}

                {/* SMTP Settings */}
                {emailSettings.provider === 'smtp' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        SMTP Host *
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        SMTP Port *
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="587"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        SMTP Username *
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="your-email@example.com"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        SMTP Password *
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your SMTP password"
                      />
                    </div>
                  </div>
                )}

                {/* API-based Providers */}
                {(emailSettings.provider === 'sendgrid' || emailSettings.provider === 'mailgun' || 
                  emailSettings.provider === 'ses' || emailSettings.provider === 'postmark' || 
                  emailSettings.provider === 'custom') && (
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        API Key *
                      </label>
                      <input
                        type="password"
                        value={emailSettings.apiKey}
                        onChange={(e) => setEmailSettings({ ...emailSettings, apiKey: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your API key"
                      />
                    </div>

                    {emailSettings.provider === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          API Endpoint *
                        </label>
                        <input
                          type="text"
                          value={emailSettings.apiEndpoint}
                          onChange={(e) => setEmailSettings({ ...emailSettings, apiEndpoint: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="https://api.yourprovider.com/v1/send"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          The API endpoint URL for sending emails
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Common Email Settings */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      From Email *
                    </label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="noreply@yourcompany.com"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      From Name *
                    </label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleSave('email')}
                    disabled={isSaving || !emailSettings.fromEmail}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('Email')}
                    disabled={testingConnection !== null || !emailSettings.fromEmail}
                  >
                    {testingConnection === 'Email' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            )}

            {/* CRM Integration Settings */}
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">CRM Integration</h2>
                    <p className="text-sm text-neutral-600 mt-1">Connect with external CRM systems</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crmSettings.enabled}
                      onChange={(e) => setCrmSettings({ ...crmSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">
                      {crmSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CRM Provider *
                  </label>
                  <select
                    value={crmSettings.provider}
                    onChange={(e) => setCrmSettings({ ...crmSettings, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="zoho">Zoho CRM</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="custom">Custom CRM</option>
                  </select>
                </div>

                {/* Custom Provider Name */}
                {crmSettings.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      CRM Name *
                    </label>
                    <input
                      type="text"
                      value={crmSettings.customProviderName}
                      onChange={(e) => setCrmSettings({ ...crmSettings, customProviderName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your custom CRM name"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={crmSettings.apiKey}
                      onChange={(e) => setCrmSettings({ ...crmSettings, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your CRM API key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      API Secret {crmSettings.provider === 'custom' ? '' : '(Optional)'}
                    </label>
                    <input
                      type="password"
                      value={crmSettings.apiSecret}
                      onChange={(e) => setCrmSettings({ ...crmSettings, apiSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your CRM API secret (if required)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Instance URL / API Endpoint {crmSettings.provider === 'custom' ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      value={crmSettings.instanceUrl}
                      onChange={(e) => setCrmSettings({ ...crmSettings, instanceUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={crmSettings.provider === 'custom' ? 'https://api.yourcrm.com/v1' : 'https://yourcompany.salesforce.com'}
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {crmSettings.provider === 'custom' 
                        ? 'The API endpoint URL for your CRM system' 
                        : 'Your CRM instance URL (if applicable)'}
                    </p>
                  </div>

                  {crmSettings.provider === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={crmSettings.webhookUrl}
                        onChange={(e) => setCrmSettings({ ...crmSettings, webhookUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://your-domain.com/api/webhooks/crm"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        URL to receive webhook notifications from your CRM
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleSave('crm')}
                    disabled={isSaving || !crmSettings.apiKey}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('CRM')}
                    disabled={testingConnection !== null || !crmSettings.apiKey}
                  >
                    {testingConnection === 'CRM' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            )}

            {/* LLM Settings */}
            {activeTab === 'llm' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">AI / Large Language Model</h2>
                    <p className="text-sm text-neutral-600 mt-1">Configure AI models for intelligent features and automation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={llmSettings.enabled}
                      onChange={(e) => setLlmSettings({ ...llmSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">
                      {llmSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">AI-Powered Features</p>
                      <p className="text-xs text-primary-700 mt-1">
                        Enable intelligent features like automated responses, document analysis, sentiment analysis, and smart recommendations powered by AI.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    LLM Provider *
                  </label>
                  <select
                    value={llmSettings.provider}
                    onChange={(e) => setLlmSettings({ ...llmSettings, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                    <option value="azure">Azure OpenAI</option>
                    <option value="aws">AWS Bedrock</option>
                    <option value="cohere">Cohere</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>

                {/* Custom Provider Name */}
                {llmSettings.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      value={llmSettings.customProviderName}
                      onChange={(e) => setLlmSettings({ ...llmSettings, customProviderName: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your custom LLM provider name"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={llmSettings.apiKey}
                      onChange={(e) => setLlmSettings({ ...llmSettings, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your LLM API key"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Get your API key from your LLM provider's dashboard
                    </p>
                  </div>

                  {(llmSettings.provider === 'custom' || llmSettings.provider === 'azure') && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        API Endpoint *
                      </label>
                      <input
                        type="text"
                        value={llmSettings.apiEndpoint}
                        onChange={(e) => setLlmSettings({ ...llmSettings, apiEndpoint: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={llmSettings.provider === 'azure' 
                          ? 'https://your-resource.openai.azure.com/' 
                          : 'https://api.yourprovider.com/v1'}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {llmSettings.provider === 'azure' 
                          ? 'Your Azure OpenAI resource endpoint' 
                          : 'The API endpoint URL for your LLM provider'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Model *
                    </label>
                    <select
                      value={llmSettings.model}
                      onChange={(e) => setLlmSettings({ ...llmSettings, model: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {llmSettings.provider === 'openai' && (
                        <>
                          <option value="gpt-4">GPT-4 (Most capable)</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cost-effective)</option>
                        </>
                      )}
                      {llmSettings.provider === 'anthropic' && (
                        <>
                          <option value="claude-3-opus">Claude 3 Opus (Most capable)</option>
                          <option value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</option>
                          <option value="claude-3-haiku">Claude 3 Haiku (Fastest)</option>
                        </>
                      )}
                      {llmSettings.provider === 'google' && (
                        <>
                          <option value="gemini-pro">Gemini Pro</option>
                          <option value="gemini-pro-vision">Gemini Pro Vision</option>
                        </>
                      )}
                      {(llmSettings.provider === 'azure' || llmSettings.provider === 'custom' || 
                        llmSettings.provider === 'aws' || llmSettings.provider === 'cohere') && (
                        <option value={llmSettings.model}>{llmSettings.model || 'Enter model name'}</option>
                      )}
                    </select>
                    {(llmSettings.provider === 'azure' || llmSettings.provider === 'custom' || 
                      llmSettings.provider === 'aws' || llmSettings.provider === 'cohere') && (
                      <input
                        type="text"
                        value={llmSettings.model}
                        onChange={(e) => setLlmSettings({ ...llmSettings, model: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mt-2"
                        placeholder="Enter model name or deployment ID"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Temperature
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={llmSettings.temperature}
                        onChange={(e) => setLlmSettings({ ...llmSettings, temperature: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        0 = Deterministic, 2 = Creative (Default: 0.7)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        step="100"
                        value={llmSettings.maxTokens}
                        onChange={(e) => setLlmSettings({ ...llmSettings, maxTokens: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Maximum response length (Default: 2000)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-2">AI Features Available:</h3>
                  <ul className="text-xs text-neutral-700 space-y-1">
                    <li>• Smart message composition and reply suggestions</li>
                    <li>• Automated document analysis and summarization</li>
                    <li>• Sentiment analysis for tenant communications</li>
                    <li>• Intelligent maintenance categorization</li>
                    <li>• Predictive insights for property management</li>
                    <li>• Natural language search and queries</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleSave('llm')}
                    disabled={isSaving || !llmSettings.apiKey}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('LLM')}
                    disabled={testingConnection !== null || !llmSettings.apiKey}
                  >
                    {testingConnection === 'LLM' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
