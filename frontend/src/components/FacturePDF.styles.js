import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 120,
    backgroundColor: 'transparent',
    padding: 5,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '',
  },
  logo: {
    width: '100%',
    height: 'auto',

  },
  textBlock: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: '#1155cc',
    marginBottom: 2,
  },
  website: {
    fontSize: 10,
    color: 'blue',
  },
  companyContact: {
    color: "blue",
    fontSize: 10,
    textDecoration: 'underline',
    italic: true,
  },
  companyWebsite: {
    color: "blue",
    fontSize: 10,
    textDecoration: 'underline',
    italic: true,
  },
  devisInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e6f7ff',
    padding: 8,
    marginTop: 10,
    borderRadius: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  devisNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  devisDate: {
    fontSize: 12,
  },
  infoSections: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  objectInfo: {
    width: '50%',
  },
  clientInfoBox: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 4,
    paddingTop: 20,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    position: 'absolute',
    top: -8,
    left: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
  },
  clientDetails: {
    marginLeft: 0,
  },
  clientDetail: {
    marginBottom: 3,
  },
  comment: {
    marginBottom: 5,
  },
  tableContainer: {
    width: '100%',
    marginBottom: 15,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
  colIndex: {
    width: '5%',
    paddingLeft: 5,
  },
  colDesignation: {
    width: '40%',
    paddingLeft: 5,
  },
  colQuantity: {
    width: '10%',
    textAlign: 'right',
    paddingRight: 10,
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 10,
  },
  colAmount: {
    width: '25%',
    textAlign: 'right',
    paddingRight: 5,
  },
  totals: {
    marginTop: 10,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLeft: {
    width: '45%',
    paddingRight: 20,
    
  },
  totalRight: {
    width: '50%',
  },
  totalNote: {
    marginBottom: 5,
    fontStyle: 'italic',
  },
  num: {
    fontSize: 10,
    display: 'block',
    position: 'relative',
    left: 40
  },
  totalInWords: {
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  finalTotal: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  totalLabel: {
    fontSize:8,
    position: 'relative',
    left: -40,
    fontWeight: 'bold',
  },
  totalValue: {
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
  paymentConditions: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 10,
  },
  underlinedTitle: {
    textDecoration: 'underline',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentText: {
    marginLeft: 10,
    fontSize: 10,
  },
  mt10: {
    marginTop: 10,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  signatureBlock: {
    width: '40%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '100%',
    marginBottom: 5,
    height: 1,
  },
  signatureLabel: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 20,
  }, footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 10,
  },
  companyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  footerr: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: 'gray',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 5,
    lineHeight: 1.2,
  },
  footerLine: {
    marginBottom: 3,
  },
  footerLinee: {
    marginBottom: 3,
    color: 'blue',
    textDecoration: 'underline',
  },
});