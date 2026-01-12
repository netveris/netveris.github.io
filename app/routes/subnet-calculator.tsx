import { useState } from "react";
import type { Route } from "./+types/subnet-calculator";
import { ToolHeader } from "~/components/tool-header";
import { Card } from "~/components/ui/card/card";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Badge } from "~/components/ui/badge/badge";
import { Calculator, Network } from "lucide-react";
import styles from "./subnet-calculator.module.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Subnet Calculator - Netveris" },
    { name: "description", content: "Calculate network subnets and IP ranges" }
  ];
};

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  cidr: number;
  totalHosts: number;
  usableHosts: number;
  binarySubnetMask: string;
  ipClass: string;
  ipType: string;
}

export default function SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState<string>("192.168.1.0");
  const [cidr, setCidr] = useState<string>("24");
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState<string>("");

  const ipToInt = (ip: string): number => {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  };

  const intToIp = (int: number): string => {
    return [
      (int >>> 24) & 0xff,
      (int >>> 16) & 0xff,
      (int >>> 8) & 0xff,
      int & 0xff,
    ].join('.');
  };

  const getIpClass = (firstOctet: number): string => {
    if (firstOctet >= 1 && firstOctet <= 126) return "A";
    if (firstOctet >= 128 && firstOctet <= 191) return "B";
    if (firstOctet >= 192 && firstOctet <= 223) return "C";
    if (firstOctet >= 224 && firstOctet <= 239) return "D (Multicast)";
    if (firstOctet >= 240 && firstOctet <= 255) return "E (Reserved)";
    return "Unknown";
  };

  const getIpType = (ip: string): string => {
    const parts = ip.split('.').map(Number);
    const firstOctet = parts[0];
    
    if (firstOctet === 10) return "Private";
    if (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) return "Private";
    if (firstOctet === 192 && parts[1] === 168) return "Private";
    if (firstOctet === 127) return "Loopback";
    if (firstOctet === 169 && parts[1] === 254) return "Link-Local";
    return "Public";
  };

  const intToBinary = (int: number): string => {
    return [
      ((int >>> 24) & 0xff).toString(2).padStart(8, '0'),
      ((int >>> 16) & 0xff).toString(2).padStart(8, '0'),
      ((int >>> 8) & 0xff).toString(2).padStart(8, '0'),
      (int & 0xff).toString(2).padStart(8, '0'),
    ].join('.');
  };

  const calculate = () => {
    setError("");
    setResult(null);

    // Validate IP
    const ipParts = ipAddress.split('.');
    if (ipParts.length !== 4 || !ipParts.every(p => {
      const num = parseInt(p);
      return !isNaN(num) && num >= 0 && num <= 255;
    })) {
      setError("Invalid IP address format");
      return;
    }

    // Validate CIDR
    const cidrNum = parseInt(cidr);
    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
      setError("CIDR must be between 0 and 32");
      return;
    }

    // Calculate subnet mask
    const mask = ~((1 << (32 - cidrNum)) - 1);
    const subnetMask = intToIp(mask >>> 0);
    const wildcardMask = intToIp((~mask) >>> 0);

    // Calculate network and broadcast addresses
    const ipInt = ipToInt(ipAddress);
    const networkInt = ipInt & mask;
    const networkAddress = intToIp(networkInt >>> 0);
    
    const totalHosts = Math.pow(2, 32 - cidrNum);
    const broadcastInt = networkInt + totalHosts - 1;
    const broadcastAddress = intToIp(broadcastInt >>> 0);

    // Calculate host range
    const firstHostInt = networkInt + 1;
    const lastHostInt = broadcastInt - 1;
    const firstHost = intToIp(firstHostInt >>> 0);
    const lastHost = intToIp(lastHostInt >>> 0);

    const usableHosts = Math.max(0, totalHosts - 2);

    setResult({
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      subnetMask,
      wildcardMask,
      cidr: cidrNum,
      totalHosts,
      usableHosts,
      binarySubnetMask: intToBinary(mask >>> 0),
      ipClass: getIpClass(parseInt(ipParts[0])),
      ipType: getIpType(ipAddress),
    });
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Subnet Calculator"
        description="Calculate network subnets, IP ranges, and subnet masks with detailed information"
        icon={<Network size={32} />}
      />

      <div className={styles.grid}>
        <Card className={styles.card}>
          <h2>Network Configuration</h2>

          <div className={styles.inputGroup}>
            <Label>IP Address</Label>
            <Input
              type="text"
              placeholder="192.168.1.0"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <Label>CIDR Notation</Label>
            <div className={styles.cidrInput}>
              <span className={styles.slash}>/</span>
              <Input
                type="number"
                min="0"
                max="32"
                placeholder="24"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <Button onClick={calculate} className={styles.calculateButton}>
            <Calculator /> Calculate Subnet
          </Button>

          <div className={styles.quickCidr}>
            <h3>Quick CIDR Selection</h3>
            <div className={styles.cidrButtons}>
              {[24, 25, 26, 27, 28, 29, 30].map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant="outline"
                  onClick={() => setCidr(c.toString())}
                >
                  /{c}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {result && (
          <Card className={styles.card}>
            <h2>Subnet Information</h2>

            <div className={styles.results}>
              <div className={styles.resultSection}>
                <h3>Network Details</h3>
                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Network Address:</span>
                    <span className={styles.value}>{result.networkAddress}/{result.cidr}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Broadcast Address:</span>
                    <span className={styles.value}>{result.broadcastAddress}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Subnet Mask:</span>
                    <span className={styles.value}>{result.subnetMask}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Wildcard Mask:</span>
                    <span className={styles.value}>{result.wildcardMask}</span>
                  </div>
                </div>
              </div>

              <div className={styles.resultSection}>
                <h3>Host Range</h3>
                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>First Usable Host:</span>
                    <span className={styles.value}>{result.firstHost}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Last Usable Host:</span>
                    <span className={styles.value}>{result.lastHost}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Total Hosts:</span>
                    <span className={styles.value}>{result.totalHosts.toLocaleString()}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Usable Hosts:</span>
                    <span className={styles.value}>{result.usableHosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.resultSection}>
                <h3>Additional Information</h3>
                <div className={styles.resultGrid}>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>IP Class:</span>
                    <Badge variant="outline">{result.ipClass}</Badge>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>IP Type:</span>
                    <Badge variant={result.ipType === "Private" ? "default" : "secondary"}>
                      {result.ipType}
                    </Badge>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Binary Subnet Mask:</span>
                    <span className={styles.binary}>{result.binarySubnetMask}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
