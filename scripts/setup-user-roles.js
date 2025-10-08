const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function setupUserRoles() {
  try {
    console.log('🚀 Setting up user roles...');

    // Get existing roles
    const rolesResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
    const existingRoles = rolesResponse.data.roles;

    console.log('📋 Existing roles:', existingRoles.map(r => r.name));

    // Check if Customer role exists
    let customerRole = existingRoles.find(role => role.name === 'Customer');
    if (!customerRole) {
      console.log('➕ Creating Customer role...');
      const customerResponse = await axios.post(`${STRAPI_URL}/api/users-permissions/roles`, {
        name: 'Customer',
        description: 'Regular customers with basic access',
        type: 'customer',
        permissions: {
          // Basic permissions for customers
          'api::product': {
            'find': true,
            'findOne': true
          },
          'api::category': {
            'find': true,
            'findOne': true
          },
          'api::blog': {
            'find': true,
            'findOne': true
          },
          'api::menu': {
            'find': true,
            'findOne': true
          },
          'api::menu-item': {
            'find': true,
            'findOne': true
          },
          'api::subscription': {
            'find': true,
            'findOne': true
          }
        }
      });
      customerRole = customerResponse.data.role;
      console.log('✅ Customer role created');
    } else {
      console.log('✅ Customer role already exists');
    }

    // Check if Subscriber role exists
    let subscriberRole = existingRoles.find(role => role.name === 'Subscriber');
    if (!subscriberRole) {
      console.log('➕ Creating Subscriber role...');
      const subscriberResponse = await axios.post(`${STRAPI_URL}/api/users-permissions/roles`, {
        name: 'Subscriber',
        description: 'Premium subscribers with full access',
        type: 'subscriber',
        permissions: {
          // Full permissions for subscribers
          'api::product': {
            'find': true,
            'findOne': true
          },
          'api::category': {
            'find': true,
            'findOne': true
          },
          'api::blog': {
            'find': true,
            'findOne': true
          },
          'api::course': {
            'find': true,
            'findOne': true
          },
          'api::recipe': {
            'find': true,
            'findOne': true
          },
          'api::menu': {
            'find': true,
            'findOne': true
          },
          'api::menu-item': {
            'find': true,
            'findOne': true
          },
          'api::subscription': {
            'find': true,
            'findOne': true
          },
          'api::usersubscription': {
            'find': true,
            'findOne': true
          }
        }
      });
      subscriberRole = subscriberResponse.data.role;
      console.log('✅ Subscriber role created');
    } else {
      console.log('✅ Subscriber role already exists');
    }

    // Update default role to Customer
    console.log('🔧 Setting default role to Customer...');
    const settingsResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/advanced`);
    const settings = settingsResponse.data;
    
    if (settings.default_role !== customerRole.id) {
      await axios.put(`${STRAPI_URL}/api/users-permissions/advanced`, {
        ...settings,
        default_role: customerRole.id
      });
      console.log('✅ Default role set to Customer');
    } else {
      console.log('✅ Default role already set to Customer');
    }

    console.log('🎉 User roles setup completed!');
    console.log('\n📋 Summary:');
    console.log(`- Customer Role ID: ${customerRole.id}`);
    console.log(`- Subscriber Role ID: ${subscriberRole.id}`);
    console.log(`- Default Role: Customer (${customerRole.id})`);

  } catch (error) {
    console.error('❌ Error setting up user roles:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the setup
setupUserRoles();
