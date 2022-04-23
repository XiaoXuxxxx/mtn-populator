/* eslint-disable max-len */
import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  Address,
  Branch,
  Zone,
  Staff,
  Machine,
  MachinePart,
  MaintenanceLog,
  Bill,
  Order,
  MaintenancePart,
} from '@prisma/client';

enum StaffPosition {
  OFFICER = 'OFFICER',
  TECHNICIAN = 'TECHNICIAN',
  PURCHASING = 'PURCHASING',
  MANAGER = 'MANAGER',
  CEO = 'CEO',
}

enum MaintenanceLogStatus {
  OPENED = 'OPENED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

enum MaintenancePartStatus {
  ORDERING = 'ORDERING',
  MAINTAINING = 'MAINTAINING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

enum OrderStatus {
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

enum MachinePartStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

const generateAddressData = (
  postalCount: number,
  regionCount: number,
  countryCount: number,
): Address[] => {
  if (postalCount <= regionCount || regionCount <= countryCount) {
    throw new Error('Invalid data');
  }

  if (postalCount > 10000 || regionCount > 1000 || countryCount > 244) {
    throw new Error('Argument range exceed limit');
  }

  const result: Address[] = [];

  const postalList: string[] = [];
  const regionList: string[] = [];
  const countryList: string[] = [];

  while (postalList.length < postalCount) {
    const newPostalCode = faker.address.zipCode();
    if (!postalList.includes(newPostalCode)) {
      postalList.push(newPostalCode);
    }
  }

  while (regionList.length < regionCount) {
    const newRegion = faker.address.city();
    if (!regionList.includes(newRegion)) {
      regionList.push(newRegion);
    }
  }

  while (countryList.length < countryCount) {
    const newCountry = faker.address.country();
    if (!countryList.includes(newCountry)) {
      countryList.push(newCountry);
    }
  }

  for (let i = 0; i < postalCount; i += 1) {
    const address: Address = {
      postal_code: postalList[i],
      country: countryList[i % countryCount],
      region: regionList[i % regionCount],
    };
    result.push(address);
  }
  return result;
};

const generateBranchData = (
  addressData: Address[],
  branchCount: number,
): Branch[] => {
  const result: Branch[] = [];
  const addressCount = addressData.length;

  for (let i = 0; i < branchCount; i += 1) {
    const branch: Branch = {
      branch_id: i + 1,
      address: `${addressData[i % addressCount].postal_code} ${faker.address.streetName()}, ${addressData[i % addressCount].region}, ${addressData[i % addressCount].country}`,
      postal_code: addressData[i % addressCount].postal_code,
      tel_no: faker.phone.phoneNumber(),
    };

    result.push(branch);
  }

  return result;
};

const generateZoneData = (
  branchData: Branch[],
  zoneAmountPerBranchRange: [fromRange: number, toRange: number],
): Zone[] => {
  const result: Zone[] = [];

  let currentZoneId = 0;

  branchData.forEach((branch) => {
    const zoneAmount = Math.floor(
      Math.random()
      * (zoneAmountPerBranchRange[1] - zoneAmountPerBranchRange[0] + 1)
      + zoneAmountPerBranchRange[0],
    );

    for (let i = 0; i < zoneAmount; i += 1) {
      if (!branch.branch_id) {
        return;
      }

      const zone: Zone = {
        branch_id: branch.branch_id,
        time_to_start: faker.date.future(),
        time_to_end: faker.date.future(),
        zone_id: currentZoneId += 1,
      };
      result.push(zone);
    }
  });

  return result;
};

const generateStaffData = (
  zoneData: Zone[],
  staffAmountPerZoneRange: [fromRange: number, toRange: number],
): Staff[] => {
  // const position = ['user', 'technician', 'purchaser', 'manager', 'admin'];
  const staffData: Staff[] = [];

  let currentStaffId = 0;

  zoneData.forEach((zone) => {
    const staffAmount = Math.floor(
      Math.random()
      * (staffAmountPerZoneRange[1] - staffAmountPerZoneRange[0] + 1)
      + staffAmountPerZoneRange[0],
    );

    for (let i = 0; i < staffAmount; i += 1) {
      const selectedPositionIndex = Math.floor(Math.random() * Object.keys(StaffPosition).length);
      const selectedPosition = Object.values(StaffPosition)[selectedPositionIndex];

      const staff: Staff = {
        staff_id: currentStaffId += 1,
        password: faker.internet.password(),
        dob: faker.date.past(),
        full_name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        tel_no: faker.phone.phoneNumber(),
        salary: Number(faker.finance.amount(0, 100000, 2)),
        position: selectedPosition,
        branch_id: zone.branch_id,
        zone_id: zone.zone_id,
      };
      staffData.push(staff);
    }
  });

  return staffData;
};

const generateMachineData = (
  zoneData: Zone[],
  machineAmountPerZoneRange: [fromRange: number, toRange: number],
): Machine[] => {
  const machineData: Machine[] = [];

  let currentMachineId = 0;

  zoneData.forEach((zone) => {
    const machineAmount = Math.floor(
      Math.random()
      * (machineAmountPerZoneRange[1] - machineAmountPerZoneRange[0] + 1)
      + machineAmountPerZoneRange[0],
    );

    for (let i = 0; i < machineAmount; i += 1) {
      if (!zone.zone_id) {
        return;
      }
      const machine: Machine = {
        machine_id: currentMachineId += 1,
        name: faker.commerce.productName(),
        serial: faker.finance.account(),
        manufacturer: faker.company.companyName(),
        registration_date: faker.date.past(),
        retired_date: faker.date.future(),
        zone_id: zone.zone_id,
      };
      machineData.push(machine);
    }
  });

  return machineData;
};

const generateMachinePartData = (
  machineData: Machine[],
  partAmountPerMachineRange: [fromRange: number, toRange: number],
  partBrokenRate: number,
): MachinePart[] => {
  const machinePartData: MachinePart[] = [];

  let currentMachinePartId = 0;

  machineData.forEach((machine) => {
    const partAmount = Math.floor(
      Math.random()
      * (partAmountPerMachineRange[1] - partAmountPerMachineRange[0] + 1)
      + partAmountPerMachineRange[0],
    );

    for (let i = 0; i < partAmount; i += 1) {
      if (!machine.machine_id) {
        return;
      }

      const selectedStatusIndex = Math.floor(Number((Math.random() < partBrokenRate)));
      const selectedStatus = Object.values(MachinePartStatus)[selectedStatusIndex];
      // console.log(selectedStatus);
      const machinePart: MachinePart = {
        machine_id: machine.machine_id,
        part_id: currentMachinePartId += 1,
        part_name: `${faker.commerce.productName()} Mk.${Math.floor(Math.random() * 100)}`,
        status: selectedStatus,
      };
      machinePartData.push(machinePart);
    }
  });

  return machinePartData;
};

const generateMaintenanceLogData = (
  machineData: Machine[],
  machinePartData: MachinePart[],
  staffData: Staff[],
  zoneData: Zone[],
  generatedPastMaintenanceRate: number,
  amountOfMaintenancePerMachineRange: [fromRange: number, toRange: number],
  failedRateForPastMaintenance: number,
  pendingRateForCurrentMaintenance: number,
): MaintenanceLog[] => {
  const maintenanceLogData: MaintenanceLog[] = [];

  const staffMaintainerByZoneId: Map<number, Staff[]> = new Map();
  const staffByZoneId: Map<number, Staff[]> = new Map();
  const machineByMachinePartId: Map<number, Machine> = new Map();

  zoneData.forEach((zone) => {
    const staffMaintainer = staffData.filter(
      (staff) => staff.position === StaffPosition.TECHNICIAN && staff.zone_id === zone.zone_id,
    );
    const staff = staffData.filter((e) => e.zone_id === zone.zone_id);

    staffMaintainerByZoneId.set(zone.zone_id, staffMaintainer);
    staffByZoneId.set(zone.zone_id, staff);
  });

  machinePartData.forEach((machinePart) => {
    const machine = machineData.find((e) => e.machine_id === machinePart.machine_id);
    if (machine) {
      machineByMachinePartId.set(machinePart.part_id, machine);
    }
  });

  let currentMaintenanceLogId = 0;

  // generated current maintenance log
  machinePartData.forEach((machinePart) => {
    if (machinePart.status === MachinePartStatus.AVAILABLE) {
      return;
    }

    const zoneId = machineByMachinePartId.get(machinePart.part_id)?.zone_id;
    if (!zoneId) return;

    const staffList: Staff[] = staffByZoneId.get(zoneId) ?? [];
    const selectedReporterId: number = staffList[
      Math.floor(Math.random() * staffList.length)
    ].staff_id;

    const maintainerList: Staff[] = staffMaintainerByZoneId.get(zoneId) ?? [];
    const selectedMaintainerId: number = maintainerList[
      Math.floor(Math.random() * maintainerList.length)
    ]?.staff_id;

    const selectedStatusIndex = Math.floor(
      Number((Math.random() < pendingRateForCurrentMaintenance)),
    );
    const selectedStatus = Object.values(MaintenanceLogStatus)[selectedStatusIndex];

    const maintenanceLog: MaintenanceLog = {
      machine_id: machinePart.machine_id,
      reporter_id: selectedReporterId,
      maintainer_id: selectedMaintainerId,
      maintenance_date: faker.date.past(),
      maintenance_id: currentMaintenanceLogId += 1,
      reason: faker.lorem.sentence(),
      report_date: faker.date.past(),
      status: selectedStatus,
    };
    maintenanceLogData.push(maintenanceLog);
  });

  // generated closed maintenance log
  machineData.forEach((machine) => {
    const isGenerated = Math.random() < generatedPastMaintenanceRate;
    if (!isGenerated || !machine.machine_id) {
      return;
    }

    const generatedAmount = Math.floor(
      Math.random()
      * (amountOfMaintenancePerMachineRange[1] - amountOfMaintenancePerMachineRange[0] + 1)
      + amountOfMaintenancePerMachineRange[0],
    );

    const staffList: Staff[] = staffByZoneId.get(machine.zone_id) ?? [];
    const maintainerList: Staff[] = staffMaintainerByZoneId.get(machine.zone_id) ?? [];

    for (let i = 0; i < generatedAmount; i += 1) {
      const selectedReporterId: number = staffList[
        Math.floor(Math.random() * staffList.length)
      ].staff_id;

      const selectedMaintainerId: number = maintainerList[
        Math.floor(Math.random() * maintainerList.length)
      ]?.staff_id;

      const selectedStatusIndex = Math.floor(
        Number((Math.random() < failedRateForPastMaintenance)),
      ) + 2;
      const selectedStatus = Object.values(MaintenanceLogStatus)[selectedStatusIndex];

      const maintenanceLog: MaintenanceLog = {
        machine_id: machine.machine_id,
        reporter_id: selectedReporterId,
        maintainer_id: selectedMaintainerId,
        maintenance_date: faker.date.past(),
        maintenance_id: currentMaintenanceLogId += 1,
        reason: faker.lorem.sentence(),
        report_date: faker.date.past(),
        status: selectedStatus,
      };

      maintenanceLogData.push(maintenanceLog);
    }
  });

  return maintenanceLogData;
};

const generateBillData = (
  staffData: Staff[],
  billAmountPerBranchRange: [fromRange: number, toRange: number],
): Bill[] => {
  const billData: Bill[] = [];

  const staffPurchasingListByBranchId: Map<number, Staff[]> = new Map();
  const branchIdList: number[] = [];

  let currentBillId = 0;

  staffData.forEach((staff) => {
    if (!staff.branch_id || staff.position !== StaffPosition.PURCHASING) {
      return;
    }

    if (!branchIdList.includes(staff.branch_id)) {
      branchIdList.push(staff.branch_id);
    }

    const staffList = staffPurchasingListByBranchId.get(staff.branch_id) ?? [];

    staffList.push(staff);
    staffPurchasingListByBranchId.set(staff.branch_id, staffList);
  });

  branchIdList.forEach((branchId) => {
    const billAmount = Math.floor(
      Math.random()
      * (billAmountPerBranchRange[1] - billAmountPerBranchRange[0] + 1)
      + billAmountPerBranchRange[0],
    );

    const staffPurchasingList: Staff[] | undefined = staffPurchasingListByBranchId
      .get(branchIdList[branchId]);

    if (!staffPurchasingList) {
      return;
    }

    for (let i = 0; i < billAmount; i += 1) {
      const selectedStaffId: number = staffPurchasingList[
        Math.floor(Math.random() * staffPurchasingList.length)
      ].staff_id;

      const bill: Bill = {
        bill_date: faker.date.past(),
        bill_id: currentBillId += 1,
        order_by: selectedStaffId,
        store_name: faker.company.companyName(),
      };

      billData.push(bill);
    }
  });

  return billData;
};

const generateOrderData = (
  billData: Bill[],
  machinePartData: MachinePart[],
  maintenanceLogData: MaintenanceLog[],
  staffData: Staff[],
  machineData: Machine[],
  zoneData: Zone[],
  generateOrderForPendingMaintenanceLogRate: number,
  generateOrderPerBillRange: [fromRange: number, toRange: number],
): Order[] => {
  const orderData: Order[] = [];

  const branchIdByStaffId: Map<number, number> = new Map();
  const billListByBranchId: Map<number, Bill[]> = new Map();
  const machineByMachinePartId: Map<number, Machine> = new Map();
  const BranchIdByZoneId: Map<number, number> = new Map();

  staffData.forEach((staff) => {
    if (!staff.branch_id) return;
    branchIdByStaffId.set(staff.staff_id, staff.branch_id);
  });

  billData.forEach((bill) => {
    const branchId = branchIdByStaffId.get(bill.order_by);
    if (!branchId) return;

    const billList = billListByBranchId.get(branchId) ?? [];
    billList.push(bill);
    billListByBranchId.set(branchId, billList);
  });

  machinePartData.forEach((machinePart) => {
    const value = machineData.find((machine) => machine.machine_id === machinePart.machine_id);
    if (!value) return;
    machineByMachinePartId.set(machinePart.part_id, value);
  });

  zoneData.forEach((zone) => {
    BranchIdByZoneId.set(zone.zone_id, zone.branch_id);
  });

  let currentOrderId = 0;

  // generate order that related to pending maintenanceLog
  maintenanceLogData.forEach((maintenanceLog) => {
    if (maintenanceLog.status !== MaintenanceLogStatus.PENDING) {
      return;
    }

    const isGenerated = Math.random() < generateOrderForPendingMaintenanceLogRate;
    if (!isGenerated) {
      return;
    }

    const machinePart = machinePartData.find((e) => e.part_id === maintenanceLog.machine_id);
    if (!machinePart) {
      return;
    }

    const machine = machineByMachinePartId.get(machinePart.part_id);
    if (!machine) {
      return;
    }

    const branchId = BranchIdByZoneId.get(machine.zone_id);
    if (!branchId) {
      return;
    }

    const billList: Bill[] | undefined = billListByBranchId.get(branchId);
    if (!billList) {
      return;
    }

    const selectedBillId: number = billList[
      Math.floor(Math.random() * billList.length)
    ].bill_id;

    const selectedStatusIndex = Math.floor(Math.random() * 2) + 1;
    const selectedStatus = Object.values(OrderStatus)[selectedStatusIndex];

    const isShipping = selectedStatus === OrderStatus.SHIPPING;

    const order: Order = {
      machine_id: machinePart.machine_id,
      price: Number(faker.commerce.price()),
      part_id: machinePart.part_id,
      order_id: currentOrderId += 1,
      bill_id: selectedBillId,
      status: selectedStatus,
      arrival_date: isShipping ? null : faker.date.past(),
    };

    orderData.push(order);
  });

  // generate order that by bill
  billData.forEach((bill) => {
    const orderAmount = Math.floor(
      Math.random()
      * (generateOrderPerBillRange[1] - generateOrderPerBillRange[0] + 1)
      + generateOrderPerBillRange[0],
    );

    const selectedMachinePartId = machinePartData[
      Math.floor(Math.random() * machinePartData.length)
    ].part_id;

    const selectedMachineId = machineByMachinePartId.get(selectedMachinePartId)?.machine_id;
    if (!selectedMachineId) {
      return;
    }

    // random status that is not delivering
    const selectedStatusIndex = Math.floor(Math.random() * 2) + 1;
    const selectedStatus = Object.values(OrderStatus)[selectedStatusIndex];
    for (let i = 0; i < orderAmount; i += 1) {
      const order: Order = {
        machine_id: selectedMachineId,
        price: Number(faker.commerce.price()),
        part_id: selectedMachinePartId,
        order_id: currentOrderId += 1,
        bill_id: bill.bill_id,
        status: selectedStatus,
        arrival_date: faker.date.past(),
      };

      orderData.push(order);
    }
  });

  return orderData;
};

const generateMaintenancePartData = (
  machinePartData: MachinePart[],
  maintenanceLogData: MaintenanceLog[],
  orderData: Order[],
): MaintenancePart[] => {
  const maintenancePartData: MaintenancePart[] = [];
  const OrderListByPartId: Map<number, Order[]> = new Map();
  const machinePartListByMachineId: Map<number, MachinePart[]> = new Map();

  orderData.forEach((order) => {
    if (!order.part_id) return;
    const orderList = OrderListByPartId.get(order.part_id) ?? [];
    orderList.push(order);
    OrderListByPartId.set(order.part_id, orderList);
  });

  machinePartData.forEach((machinePart) => {
    if (!machinePart.machine_id) return;
    const machinePartList = machinePartListByMachineId.get(machinePart.machine_id) ?? [];
    machinePartList.push(machinePart);
    machinePartListByMachineId.set(machinePart.machine_id, machinePartList);
  });

  let currentMaintenancePartId = 0;
  const usedOrderIdList: (number | undefined)[] = [];
  // generate maintenancePart in pending maintenanceLog
  maintenanceLogData.forEach((maintenanceLog) => {
    if (maintenanceLog.status === MaintenanceLogStatus.OPENED) {
      return;
    }

    const orderList = OrderListByPartId.get(maintenanceLog.machine_id);
    const unUsedOrderList = orderList?.filter((order) => !usedOrderIdList.includes(order.order_id));
    const selectedOrder = unUsedOrderList?.[Math.floor(Math.random() * unUsedOrderList.length)];
    usedOrderIdList.push(selectedOrder?.order_id);

    if (!selectedOrder?.part_id) {
      return;
    }

    let selectedStatus = '';
    if (maintenanceLog.status === MaintenanceLogStatus.SUCCESS) {
      selectedStatus = MaintenancePartStatus.SUCCESS;
    } else {
      selectedStatus = Object.values(MaintenancePartStatus)[
        Math.floor(Math.random() * 2) + 1
      ];
    }

    const maintenancePart: MaintenancePart = {
      maintenance_id: currentMaintenancePartId += 1,
      order_id: selectedOrder.order_id,
      part_id: selectedOrder.part_id,
      type: String(Math.random()),
      status: selectedStatus,
    };

    maintenancePartData.push(maintenancePart);
  });

  maintenanceLogData.forEach((maintenanceLog) => {
    const machinePartList = machinePartListByMachineId.get(maintenanceLog.machine_id);
    if (!machinePartList) {
      return;
    }

    machinePartList.forEach((machinePart) => {
      let selectedStatus = '';
      if (maintenanceLog.status === MaintenanceLogStatus.SUCCESS) {
        selectedStatus = MaintenancePartStatus.SUCCESS;
      } else {
        selectedStatus = Object.values(MaintenancePartStatus)[
          Math.floor(Math.random() * 2) + 1
        ];
      }
      const maintenancePart: MaintenancePart = {
        maintenance_id: maintenanceLog.maintenance_id,
        order_id: null,
        part_id: machinePart.part_id,
        status: selectedStatus,
        type: String(Math.random()),
      };

      maintenancePartData.push(maintenancePart);
    });
  });

  return maintenancePartData;
};

const main = async () => {
  const postalCount: number = 100;
  const regionCount: number = 10;
  const countryCount: number = 2;
  const branchCount: number = 200;
  const zoneAmountPerBranchRange: [fromRange: number, toRange: number] = [3, 5];
  const staffAmountPerZoneRange: [fromRange: number, toRange: number] = [30, 50];
  const machineAmountPerZoneRange: [fromRange: number, toRange: number] = [3, 5];
  const partAmountPerMachineRange: [fromRange: number, toRange: number] = [3, 5];
  const partBrokenRate: number = 0.01;
  const generatedPastMaintenanceRate: number = 0.1;
  const amountOfMaintenancePerMachineRange: [fromRange: number, toRange: number] = [1, 10];
  const failedRateForPastMaintenance: number = 0.1;
  const pendingRateForCurrentMaintenance: number = 0.5;
  const billAmountPerBranchRange: [fromRange: number, toRange: number] = [50, 90];
  const generateOrderForPendingMaintenanceLogRate: number = 0.8;
  const generateOrderPerBillRange: [fromRange: number, toRange: number] = [1, 10];

  // const postalCount: number = 10;
  // const regionCount: number = 5;
  // const countryCount: number = 2;
  // const branchCount: number = 100;
  // const zoneAmountPerBranchRange: [fromRange: number, toRange: number] = [10, 20];
  // const staffAmountPerZoneRange: [fromRange: number, toRange: number] = [20, 200];
  // const machineAmountPerZoneRange: [fromRange: number, toRange: number] = [10, 20];
  // const partAmountPerMachineRange: [fromRange: number, toRange: number] = [2, 10];
  // const partBrokenRate: number = 0.01;
  // const generatedPastMaintenanceRate: number = 0.3;
  // const amountOfMaintenancePerMachineRange: [fromRange: number, toRange: number] = [20, 40];
  // const failedRateForPastMaintenance: number = 0.1;
  // const pendingRateForCurrentMaintenance: number = 0.5;
  // const billAmountPerBranchRange: [fromRange: number, toRange: number] = [40, 60];
  // const generateOrderForPendingMaintenanceLogRate: number = 0.8;
  // const generateOrderPerBillRange: [fromRange: number, toRange: number] = [2, 10];

  const prisma = new PrismaClient();

  const addressData = generateAddressData(postalCount, regionCount, countryCount);
  console.log(`[gen][1/10] generate address data successfully (${addressData.length} rows)`);
  const branchData = generateBranchData(addressData, branchCount);
  console.log(`[gen][2/10] generate branch data successfully (${branchData.length} rows)`);
  const zoneData = generateZoneData(branchData, zoneAmountPerBranchRange);
  console.log(`[gen][3/10] generate zone data successfully (${zoneData.length} rows)`);
  const staffData = generateStaffData(zoneData, staffAmountPerZoneRange);
  console.log(`[gen][4/10] generate staff data successfully (${staffData.length} rows)`);
  const machineData = generateMachineData(zoneData, machineAmountPerZoneRange);
  console.log(`[gen][5/10] generate machine data successfully (${machineData.length} rows)`);
  const machinePartData = generateMachinePartData(machineData, partAmountPerMachineRange, partBrokenRate);
  console.log(`[gen][6/10] generate machinePart data successfully (${machinePartData.length} rows)`);
  const maintenanceLogData = generateMaintenanceLogData(
    machineData,
    machinePartData,
    staffData,
    zoneData,
    generatedPastMaintenanceRate,
    amountOfMaintenancePerMachineRange,
    failedRateForPastMaintenance,
    pendingRateForCurrentMaintenance,
  );
  console.log(`[gen][7/10] generate maintenanceLog data successfully (${maintenanceLogData.length} rows)`);
  const billData = generateBillData(staffData, billAmountPerBranchRange);
  console.log(`[gen][8/10] generate bill data successfully (${billData.length} rows)`);
  const orderData = generateOrderData(
    billData,
    machinePartData,
    maintenanceLogData,
    staffData,
    machineData,
    zoneData,
    generateOrderForPendingMaintenanceLogRate,
    generateOrderPerBillRange,
  );
  console.log(`[gen][9/10] generate order data successfully (${orderData.length} rows)`);
  const maintenancePartData = generateMaintenancePartData(
    machinePartData,
    maintenanceLogData,
    orderData,
  );
  console.log(`[gen][10/10] generate maintenancePart data successfully (${maintenancePartData.length} rows)`);

  const maintenancePartDeletedCount = await prisma.maintenancePart.deleteMany({});
  console.log(`[del][1/10] delete maintenancePart data successfully (${maintenancePartDeletedCount.count} rows)`);
  const orderDeletedCount = await prisma.order.deleteMany({});
  console.log(`[del][2/10] delete order data successfully (${orderDeletedCount} rows)`);
  const billDeletedCount = await prisma.bill.deleteMany({});
  console.log(`[del][3/10] delete bill data successfully (${billDeletedCount} rows)`);
  const maintenanceLogDeletedCount = await prisma.maintenanceLog.deleteMany({});
  console.log(`[del][4/10] delete maintenanceLog data successfully (${maintenanceLogDeletedCount.count} rows)`);
  const machinePartDeletedCount = await prisma.machinePart.deleteMany({});
  console.log(`[del][5/10] delete machinePart data successfully (${machinePartDeletedCount.count} rows)`);
  const machineDeletedCount = await prisma.machine.deleteMany({});
  console.log(`[del][6/10] delete machine data successfully (${machineDeletedCount.count} rows)`);
  const staffDeletedCount = await prisma.staff.deleteMany({});
  console.log(`[del][7/10] delete staff data successfully (${staffDeletedCount.count} rows)`);
  const zoneDeletedCount = await prisma.zone.deleteMany({});
  console.log(`[del][8/10] delete zone data successfully (${zoneDeletedCount.count} rows)`);
  const branchDeletedCount = await prisma.branch.deleteMany({});
  console.log(`[del][9/10] delete branch data successfully (${branchDeletedCount.count} rows)`);
  const addressDeletedCount = await prisma.address.deleteMany({});
  console.log(`[del][10/10] delete address data successfully (${addressDeletedCount.count} rows)`);

  const addressDataCount = await prisma.address.createMany({ data: addressData }).catch(() => { });
  console.log(`[ins][1/10] insert address data successfully (${addressDataCount?.count} rows)`);
  const branchDataCount = await prisma.branch.createMany({ data: branchData }).catch(() => { });
  console.log(`[ins][2/10] insert branch data successfully (${branchDataCount?.count} rows)`);
  const zoneDataCount = await prisma.zone.createMany({ data: zoneData }).catch(() => { });
  console.log(`[ins][3/10] insert zone data successfully (${zoneDataCount?.count} rows)`);
  const staffDataCount = await prisma.staff.createMany({ data: staffData }).catch(() => { });
  console.log(`[ins][4/10] insert staff data successfully (${staffDataCount?.count} rows)`);
  const machineDataCount = await prisma.machine.createMany({ data: machineData }).catch(() => { });
  console.log(`[ins][5/10] insert machine data successfully (${machineDataCount?.count} rows)`);
  const machinePartDataCount = await prisma.machinePart.createMany({ data: machinePartData }).catch(() => { });
  console.log(`[ins][6/10] insert machinePart data successfully (${machinePartDataCount?.count} rows)`);
  const maintenanceLogDataCount = await prisma.maintenanceLog.createMany({ data: maintenanceLogData }).catch(() => { });
  console.log(`[ins][7/10] insert maintenanceLog data successfully (${maintenanceLogDataCount?.count} rows)`);
  const billDataCount = await prisma.bill.createMany({ data: billData }).catch(() => { });
  console.log(`[ins][8/10] insert bill data successfully (${billDataCount?.count} rows)`);
  const orderDataCount = await prisma.order.createMany({ data: orderData }).catch(() => { });
  console.log(`[ins][9/10] insert order data successfully (${orderDataCount?.count} rows)`);

  const maintenancePartDataCount = await prisma.maintenancePart.createMany({ data: maintenancePartData }).catch(() => { });
  console.log(`[ins][10/10] insert maintenancePart data successfully (${maintenancePartDataCount?.count} rows)`);
};

main();
