/**
 * Seed script for populating the database with sample ISP troubleshooting scenarios
 *
 * This script demonstrates the seed data format for MSR/FTTH scenarios.
 * To customize for a different ISP, replace the scenarios array below with
 * your own scenario data following the same structure:
 *
 * { title: string, description: string }
 *
 * The script will automatically generate embeddings and insert them into the database.
 */

import { generateEmbedding } from '../lib/embeddings'
import { insertScenario, closePool } from '../lib/db'

// Sample MSR/FTTH troubleshooting scenarios
// Structure: { title: string, description: string }
// This format is easily replaceable for different ISP types
const scenarios = [
  {
    title: 'Router Power Light is Red',
    description:
      "The router's power indicator light is showing red. This typically indicates a hardware failure, power supply issue, or the router is in a failed state. Check power connections, try unplugging and replugging the power adapter, and verify the power adapter is functioning correctly.",
  },
  {
    title: 'Router Internet Light is Orange/Amber',
    description:
      "The internet/WAN light on the router is showing orange or amber color instead of green. This usually means the router is attempting to establish a connection but cannot authenticate or sync with the ISP's network. Check for service outages, verify account status, and ensure all cables are properly connected.",
  },
  {
    title: 'No Internet Connection',
    description:
      'User reports complete loss of internet connectivity. All devices are unable to access the internet. Check router status lights, verify cable connections, restart the router, and check for any service outages in the area. May require ISP authentication reset.',
  },
  {
    title: 'Slow Internet Speeds',
    description:
      'Internet connection is working but speeds are significantly slower than expected. Users experiencing slow download/upload speeds, buffering, or high latency. Check for bandwidth congestion, verify service plan limits, test with wired connection, and check for background processes consuming bandwidth.',
  },
  {
    title: 'Authentication Failure',
    description:
      'Router cannot authenticate with ISP network. Connection attempts are being rejected. This may indicate incorrect credentials, account suspension, or MAC address issues. Verify account status, check for credential changes, and may require MAC address registration or account reactivation.',
  },
  {
    title: 'Ethernet Port Not Working',
    description:
      'One or more Ethernet ports on the router are not functioning. Devices connected via Ethernet cable cannot establish a connection. Check cable integrity, try different ports, verify port status in router settings, and check for physical damage to the port.',
  },
  {
    title: 'WiFi Signal is Weak',
    description:
      'Wireless signal strength is poor, causing intermittent connections or slow speeds. Users experiencing dropped connections or weak signal in certain areas. Check router placement, reduce interference from other devices, adjust antenna position, and consider WiFi extender or mesh network solution.',
  },
  {
    title: 'Router Keeps Restarting',
    description:
      'Router continuously reboots or restarts on its own. Device powers on, runs for a short period, then restarts in a loop. This may indicate overheating, power supply issues, firmware corruption, or hardware failure. Check temperature, verify power supply stability, and may require firmware reset or hardware replacement.',
  },
  {
    title: 'Fiber Optic Cable Damage',
    description:
      'Physical damage to the fiber optic cable connecting to the ONT (Optical Network Terminal). Visible damage to the cable, bent or kinked fiber, or broken connector. Fiber cables are sensitive and any damage can cause complete service loss. Requires professional repair or replacement of the fiber cable.',
  },
  {
    title: 'ONT Power Light Off',
    description:
      'The Optical Network Terminal (ONT) power indicator is off or not lit. The ONT is not receiving power or has failed. Check power connections, verify power adapter is plugged in and functioning, check for power outlet issues, and verify ONT is not in a failed state requiring replacement.',
  },
  {
    title: 'Cannot Access Router Admin Panel',
    description:
      'User unable to access router configuration interface via web browser. Connection attempts to router IP address fail or timeout. Verify correct IP address, check network connection, ensure router is powered on, try different browser, and may require factory reset if credentials are unknown.',
  },
  {
    title: 'DNS Resolution Issues',
    description:
      "Internet connection works but websites cannot be resolved. Browser shows 'DNS server not responding' or similar errors. Can access sites by IP address but not by domain name. Check DNS settings, try alternative DNS servers (8.8.8.8, 1.1.1.1), flush DNS cache, and verify router DNS configuration.",
  },
  {
    title: 'Port Forwarding Not Working',
    description:
      "Port forwarding rules configured in router are not functioning. Applications or services requiring port forwarding cannot be accessed from outside the network. Verify port forwarding rules are correctly configured, check firewall settings, ensure external IP hasn't changed, and verify service is running on correct port.",
  },
  {
    title: 'Multiple Devices Cannot Connect',
    description:
      'Several devices are unable to connect to the network simultaneously. Some devices connect while others fail, or connection limit appears to be reached. Check router device limit settings, verify DHCP pool size, check for IP conflicts, and ensure router can handle the number of connected devices.',
  },
  {
    title: 'Service Intermittent - Works Then Drops',
    description:
      'Internet connection works for a period then drops, reconnects, and repeats. Connection is unstable with frequent disconnections. Check for loose cable connections, verify signal quality, check for interference, monitor router logs for errors, and verify service stability from ISP side.',
  },
]

async function seedDatabase() {
  console.log('Starting database seeding...')
  console.log(`Processing ${scenarios.length} scenarios...`)

  try {
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i]
      console.log(
        `[${i + 1}/${scenarios.length}] Processing: ${scenario.title}`,
      )

      // Generate embedding for the scenario description
      // Combine title and description for better semantic matching
      const textToEmbed = `${scenario.title}. ${scenario.description}`
      const embedding = await generateEmbedding(textToEmbed)

      // Insert scenario with embedding into database
      await insertScenario(scenario.title, scenario.description, embedding)

      console.log(`✓ Inserted: ${scenario.title}`)
    }

    console.log('\n✓ Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await closePool()
  }
}

// Run the seed script
seedDatabase()
